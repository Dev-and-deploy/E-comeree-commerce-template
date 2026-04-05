import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "super_admin" | "admin" | "editor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: AuthState = {
  user: {
    id: "1",
    name: "John Admin",
    email: "admin@store.com",
    role: "super_admin",
    avatar: "",
  },
  isAuthenticated: true,
  token: "mock-jwt-token",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ email: string; password: string }>) {
      // Mock login
      const { email } = action.payload;
      const role: UserRole = email.includes("super")
        ? "super_admin"
        : email.includes("editor")
          ? "editor"
          : "admin";
      state.user = {
        id: "1",
        name: role === "super_admin" ? "Super Admin" : "Admin User",
        email,
        role,
      };
      state.isAuthenticated = true;
      state.token = "mock-jwt-token";
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
