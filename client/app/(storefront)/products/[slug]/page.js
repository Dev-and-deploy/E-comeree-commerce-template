import { fetchProduct } from "../../../../lib/api.js";
import ProductDetail from "../../../../components/product/ProductDetail.jsx";
import { notFound } from "next/navigation";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  try {
    const res = await fetchProduct(params.slug);
    const product = res?.data;
    if (!product) return { title: "Product not found" };
    return {
      title: product.seoTitle || product.name,
      description: product.seoDesc || product.description?.slice(0, 160),
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 160),
        images: product.images?.[0] ? [{ url: product.images[0] }] : [],
        type: "website",
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }) {
  let product = null;
  try {
    const res = await fetchProduct(params.slug);
    product = res?.data;
  } catch {}

  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product} />
    </>
  );
}
