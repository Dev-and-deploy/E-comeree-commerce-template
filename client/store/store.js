import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice.js";
import authReducer from "./slices/authSlice.js";
import themeReducer from "./slices/themeSlice.js";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    theme: themeReducer,
  },
});
