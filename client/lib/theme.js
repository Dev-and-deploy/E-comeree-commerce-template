export function buildCssVariables(theme) {
  return {
    "--color-primary": theme.primaryColor || "#1a1a2e",
    "--color-secondary": theme.secondaryColor || "#ffffff",
    "--color-accent": theme.accentColor || "#e94560",
    "--font-family": theme.fontFamily || "Inter",
    "--border-radius": theme.borderRadius || "0.5rem",
  };
}

export function injectThemeStyles(theme) {
  const vars = buildCssVariables(theme);
  return Object.entries(vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

export const TEMPLATE_MAP = {
  fashion: () => import("../templates/fashion/index.js"),
  electronics: () => import("../templates/electronics/index.js"),
  minimal: () => import("../templates/minimal/index.js"),
  modern: () => import("../templates/modern/index.js"),
};

export function getTemplateName(theme) {
  return theme?.template?.slug || "fashion";
}
