import { AuthService } from "./auth.service.js";
import { success, created } from "../../shared/helpers/response.js";
import { ApiError } from "../../shared/errors/ApiError.js";

const authService = new AuthService();

const ACCESS_MAX_AGE  = 15 * 60 * 1000;           // 15 minutes
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;  // 7 days

function cookieOpts(maxAge, path = "/") {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // production cross-origin (e.g. admin.x.com → api.x.com): needs "none"
    // development localhost: "lax" works fine without HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge,
    path,
  };
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie("accessToken", accessToken, cookieOpts(ACCESS_MAX_AGE, "/"));
  // Scope the refresh token to the auth prefix — it won't be sent to other routes
  res.cookie("refreshToken", refreshToken, cookieOpts(REFRESH_MAX_AGE, "/api/auth"));
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/api/auth" });
}

// Lightweight cookie reader — avoids adding the cookie-parser package
function parseCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = cookieHeader.match(new RegExp("(?:^|;\\s*)" + escaped + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

// ─────────────────────────────────────────────────────────────────────────────

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    setAuthCookies(res, result);
    created(res, { user: result.user }, "Registration successful");
  } catch (err) { next(err); }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    setAuthCookies(res, result);
    // Return only the user — tokens live in cookies, not the response body
    success(res, { user: result.user }, "Login successful");
  } catch (err) { next(err); }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = parseCookie(req.headers.cookie, "refreshToken");
    if (!token) throw ApiError.unauthorized("No refresh token");

    const tokens = await authService.refreshToken(token);
    setAuthCookies(res, tokens);
    success(res, null, "Token refreshed");
  } catch (err) { next(err); }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    clearAuthCookies(res);
    success(res, null, "Logged out");
  } catch (err) { next(err); }
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.me(req.user.id);
    success(res, user);
  } catch (err) { next(err); }
};
