import { fetchActiveTheme } from "../../lib/api.js";
import ThemeProvider from "../../providers/ThemeProvider.jsx";
import Header from "../../components/layout/Header.jsx";
import Footer from "../../components/layout/Footer.jsx";

export default async function StorefrontLayout({ children }) {
  let themeConfig = null;
  try {
    const res = await fetchActiveTheme();
    themeConfig = res?.data || null;
  } catch {}

  return (
    <ThemeProvider themeConfig={themeConfig}>
      <div className="flex flex-col min-h-screen">
        <Header theme={themeConfig} />
        <main className="flex-1">{children}</main>
        <Footer theme={themeConfig} />
      </div>
    </ThemeProvider>
  );
}
