import jwt from "jsonwebtoken";
import config from "../../core/config/index.js";
import { ApiError } from "../errors/ApiError.js";
import prisma from "../../core/database/prisma.js";

// Read a named cookie from the raw cookie header string
function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = cookieHeader.match(new RegExp("(?:^|;\\s*)" + escaped + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

// Extract the access token: cookie first, Authorization header as fallback
function extractToken(req) {
  const fromCookie = parseCookie(req.headers.cookie, "accessToken");
  if (fromCookie) return fromCookie;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);

  return null;
}

export const authenticate = async (req, _res, next) => {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized("No token provided");

    const payload = jwt.verify(token, config.jwt.secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user) throw ApiError.unauthorized("User not found");
    if (!user.isActive) throw ApiError.unauthorized("Account deactivated");

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) return next(ApiError.unauthorized("Invalid token"));
    if (err instanceof jwt.TokenExpiredError) return next(ApiError.unauthorized("Token expired"));
    next(err);
  }
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return next();

    const payload = jwt.verify(token, config.jwt.secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });

    req.user = user || null;
    next();
  } catch {
    next();
  }
};
