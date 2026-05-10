export const shouldBypassNextImageOptimization = (src = "") =>
  src.startsWith("http://localhost:4000/uploads/") || src.startsWith("/uploads/");
