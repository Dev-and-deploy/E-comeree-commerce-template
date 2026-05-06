import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "theme",
  initialState: { config: null, template: "fashion" },
  reducers: {
    setThemeConfig(state, action) {
      state.config = action.payload;
      state.template = action.payload?.template?.slug || "fashion";
    },
  },
});

export const { setThemeConfig } = themeSlice.actions;
export const selectThemeConfig = (s) => s.theme.config;
export const selectTemplate = (s) => s.theme.template;
export default themeSlice.reducer;
