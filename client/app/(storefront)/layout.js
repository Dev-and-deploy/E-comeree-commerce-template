import { fetchActiveTheme, fetchBannerCoupon } from "../../lib/api.js";
import ThemeProvider from "../../providers/ThemeProvider.jsx";
import Header from "../../components/layout/Header.jsx";
import Footer from "../../components/layout/Footer.jsx";
import AnnouncementBar from "../../components/layout/AnnouncementBar.jsx";

export default async function StorefrontLayout({ children }) {
  let themeConfig = null;
  let bannerCoupon = null;
  try {
    const res = await fetchActiveTheme();
    themeConfig = res?.data || null;
  } catch {}
  try {
    const res = await fetchBannerCoupon();
    bannerCoupon = res?.data || null;
  } catch {}

  return (
    <ThemeProvider themeConfig={themeConfig}>
      <div className="flex flex-col min-h-screen">
        <AnnouncementBar coupon={bannerCoupon} />
        <Header theme={themeConfig} />
        <main className="flex-1">{children}</main>
        <Footer theme={themeConfig} />
      </div>
    </ThemeProvider>
  );
}
