import "dotenv/config";

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 4000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  adminUrl: process.env.ADMIN_URL || "http://localhost:8080",

  db: {
    url: process.env.DATABASE_URL,
  },

  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || "noreply@store.com",
  },

  store: {
    name: process.env.STORE_NAME || "MyStore",
  },
};

export default config;
