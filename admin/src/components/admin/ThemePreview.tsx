import type { ThemeSettings } from "@/store/api/themeApi";

interface Props {
  form: Partial<ThemeSettings>;
}

const MOCK_PRODUCTS = [
  { name: "Classic Tee", price: "$29.99" },
  { name: "Slim Jeans", price: "$59.99" },
  { name: "Sneakers", price: "$89.99" },
];

function makeButton(
  style: string,
  accent: string,
  radius: string,
  font: string,
  size: "sm" | "md" = "md"
): React.CSSProperties {
  const pad = size === "sm" ? "3px 10px" : "7px 20px";
  const fs = size === "sm" ? 9 : 11;

  if (style === "outline") {
    return {
      background: "transparent",
      color: accent,
      border: `1.5px solid ${accent}`,
      borderRadius: radius,
      cursor: "pointer",
      fontFamily: font,
      padding: pad,
      fontSize: fs,
      fontWeight: 600,
    };
  }
  if (style === "ghost") {
    return {
      background: "transparent",
      color: accent,
      border: "none",
      borderRadius: radius,
      cursor: "pointer",
      fontFamily: font,
      padding: pad,
      fontSize: fs,
      fontWeight: 600,
      textDecoration: "underline",
    };
  }
  // solid (default)
  return {
    background: accent,
    color: "#fff",
    border: "none",
    borderRadius: radius,
    cursor: "pointer",
    fontFamily: font,
    padding: pad,
    fontSize: fs,
    fontWeight: 600,
  };
}

function layoutPadding(layoutType: string): string {
  if (layoutType === "centered") return "0 40px";
  if (layoutType === "wide")     return "0 4px";
  return "0 16px"; // default
}

export default function ThemePreview({ form }: Props) {
  const primary     = form.primaryColor   || "#1a1a2e";
  const secondary   = form.secondaryColor || "#ffffff";
  const accent      = form.accentColor    || "#e94560";
  const font        = form.fontFamily     || "Inter";
  const radius      = form.borderRadius   || "0.5rem";
  const storeName   = form.storeName      || "MyStore";
  const logo        = form.logoUrl;
  const btnStyle    = form.buttonStyle    || "solid";
  const layoutType  = form.layoutType     || "default";

  const heroBtn  = makeButton(btnStyle, accent, radius, font, "md");
  const cardBtn  = makeButton(btnStyle, accent, radius, font, "sm");
  const hPad     = layoutPadding(layoutType);

  // Google Fonts injection
  const fontUrl = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, "+")}:wght@400;600;700;800&display=swap`;

  return (
    <div style={{ fontFamily: `'${font}', sans-serif`, fontSize: 12, borderRadius: "0.75rem", overflow: "hidden", border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}>
      <link rel="stylesheet" href={fontUrl} />

      {/* Layout label badge */}
      <div style={{ background: "#f3f4f6", padding: "3px 10px", fontSize: 9, color: "#6b7280", textAlign: "center", letterSpacing: 1, textTransform: "uppercase" }}>
        Layout: {layoutType} · Font: {font} · Button: {btnStyle}
      </div>

      {/* Header */}
      <div style={{ background: primary, color: secondary, padding: `10px ${layoutType === "centered" ? "40px" : "16px"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {logo && (
            <img src={logo} alt="logo" style={{ height: 20, objectFit: "contain", borderRadius: 4 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}
          <span style={{ fontWeight: 800, fontSize: 14, fontFamily: `'${font}', sans-serif` }}>{storeName}</span>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 10, opacity: 0.75 }}>
          <span>Home</span><span>Products</span><span>Cart</span>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)`, color: secondary, padding: "28px 16px", textAlign: "center" }}>
        <p style={{ fontSize: 9, opacity: 0.6, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, fontFamily: `'${font}', sans-serif` }}>New Collection</p>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, lineHeight: 1.2, fontFamily: `'${font}', sans-serif` }}>Welcome to {storeName}</h2>
        <p style={{ fontSize: 11, opacity: 0.75, marginBottom: 14, fontFamily: `'${font}', sans-serif` }}>Discover our hand-picked selection</p>
        <button style={heroBtn}>Shop Now</button>
      </div>

      {/* Products */}
      <div style={{ background: secondary, padding: "16px" }}>
        <div style={{ margin: hPad }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: primary, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1, fontFamily: `'${font}', sans-serif` }}>Featured</p>
          <div style={{ display: "grid", gridTemplateColumns: layoutType === "centered" ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 8 }}>
            {MOCK_PRODUCTS.slice(0, layoutType === "centered" ? 2 : 3).map((p) => (
              <div key={p.name} style={{ borderRadius: radius, overflow: "hidden", border: `1px solid ${primary}18`, background: "#fafafa" }}>
                <div style={{ background: `linear-gradient(135deg,${primary}18,${accent}18)`, height: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${accent}55` }} />
                </div>
                <div style={{ padding: "7px 8px" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: primary, marginBottom: 2, fontFamily: `'${font}', sans-serif` }}>{p.name}</p>
                  <p style={{ fontSize: 10, color: accent, fontWeight: 700, marginBottom: 5 }}>{p.price}</p>
                  <button style={{ ...cardBtn, width: "100%" }}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner */}
      <div style={{ background: accent, color: "#fff", padding: "7px 16px", textAlign: "center", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, fontFamily: `'${font}', sans-serif` }}>
        FREE SHIPPING ON ORDERS OVER $50
      </div>

      {/* Footer */}
      <div style={{ background: primary, color: secondary, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: `'${font}', sans-serif` }}>{storeName}</span>
        <span style={{ fontSize: 9, opacity: 0.55 }}>© 2026 All rights reserved</span>
      </div>
    </div>
  );
}
