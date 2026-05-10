import { createSlice } from "@reduxjs/toolkit";

const loadCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  if (typeof window !== "undefined") localStorage.setItem("cart", JSON.stringify(items));
};

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    initCart(state) {
      state.items = loadCart();
    },
    addToCart(state, action) {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ ...product, quantity });
      }
      saveCart(state.items);
    },
    removeFromCart(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      saveCart(state.items);
    },
    updateQuantity(state, action) {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.id !== id);
      } else {
        const item = state.items.find((i) => i.id === id);
        if (item) item.quantity = quantity;
      }
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      saveCart([]);
    },
  },
});

export const { initCart, addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export const selectCartItems = (s) => s.cart.items;
export const selectCartTotal = (s) => s.cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
export const selectCartCount = (s) => s.cart.items.reduce((acc, i) => acc + i.quantity, 0);

export default cartSlice.reducer;
