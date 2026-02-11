import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThemeState {
  mode: "light" | "dark";
  sidebarCollapsed: boolean;
}

const initialState: ThemeState = {
  mode: "light",
  sidebarCollapsed: false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setTheme(state, action: PayloadAction<"light" | "dark">) {
      state.mode = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
  },
});

export const { toggleTheme, setTheme, toggleSidebar } = themeSlice.actions;
export default themeSlice.reducer;
