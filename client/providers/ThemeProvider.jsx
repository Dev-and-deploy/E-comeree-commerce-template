"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setThemeConfig } from "../store/slices/themeSlice.js";
import { buildCssVariables } from "../lib/theme.js";

export default function ThemeProvider({ themeConfig, children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!themeConfig) return;
    dispatch(setThemeConfig(themeConfig));

    const vars = buildCssVariables(themeConfig);
    const root = document.documentElement;
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

    if (themeConfig.customCss) {
      const existing = document.getElementById("theme-custom-css");
      if (existing) existing.remove();
      const style = document.createElement("style");
      style.id = "theme-custom-css";
      style.textContent = themeConfig.customCss;
      document.head.appendChild(style);
    }
  }, [themeConfig, dispatch]);

  return <>{children}</>;
}
