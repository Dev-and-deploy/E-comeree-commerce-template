import "./globals.css";
import ReduxProvider from "../providers/ReduxProvider.jsx";
import { SettingsProvider } from "../providers/SettingsProvider.jsx";
import { fetchActiveTheme, fetchStoreSettings } from "../lib/api.js";
import { buildCssVariables } from "../lib/theme.js";

export async function generateMetadata() {
  try {
    const res = await fetchActiveTheme();
    const theme = res?.data;
    return {
      title: { default: theme?.storeName || "MyStore", template: `%s | ${theme?.storeName || "MyStore"}` },
      description: "Premium e-commerce store",
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    };
  } catch {
    return { title: "MyStore" };
  }
}

export default async function RootLayout({ children }) {
  let themeConfig = null;
  let cssVars = {};
  let storeSettings = null;

  try {
    const res = await fetchActiveTheme();
    themeConfig = res?.data || null;
    if (themeConfig) cssVars = buildCssVariables(themeConfig);
  } catch {}

  try {
    const res = await fetchStoreSettings();
    storeSettings = res?.data || null;
  } catch {}

  const cssVarString = Object.entries(cssVars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

  return (
    <html lang="en">
      <head>
        {themeConfig?.fontFamily && (
          <link
            rel="stylesheet"
            href={`https://fonts.googleapis.com/css2?family=${themeConfig.fontFamily.replace(" ", "+")}:wght@300;400;500;600;700&display=swap`}
          />
        )}
        {cssVarString && <style>{`:root{${cssVarString}}`}</style>}
      </head>
      <body>
        <ReduxProvider>
          <SettingsProvider settings={storeSettings}>
            {children}
          </SettingsProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
