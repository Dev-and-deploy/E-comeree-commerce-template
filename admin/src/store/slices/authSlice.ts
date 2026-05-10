import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "super_admin" | "admin" | "editor";

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
  /**
   * Becomes true after the initial /auth/me check resolves (success or failure).
   * ProtectedRoute uses this to avoid a flash redirect before the session is confirmed.
   */
  authInitialized: boolean;
}

// Only persist non-sensitive user profile — never tokens
function loadUser(): User | null {
  try {
    const raw = sessionStorage.getItem("admin_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const storedUser = loadUser();

const initialState: AuthState = {
  user: storedUser,
  // Optimistically mark as authenticated if we have a cached user.
  // The /auth/me call on startup will correct this if the cookie has expired.
  isAuthenticated: !!storedUser,
  authInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User }>) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.authInitialized = true;
      sessionStorage.setItem("admin_user", JSON.stringify(action.payload.user));
    },
    setAuthInitialized(state, action: PayloadAction<{ user?: User | null }>) {
      const user = action.payload.user ?? null;
      state.authInitialized = true;
      if (user) {
        state.user = user;
        state.isAuthenticated = true;
        sessionStorage.setItem("admin_user", JSON.stringify(user));
      } else {
        state.user = null;
        state.isAuthenticated = false;
        sessionStorage.removeItem("admin_user");
      }
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      sessionStorage.setItem("admin_user", JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem("admin_user");
    },
  },
});

export const { setCredentials, setAuthInitialized, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
