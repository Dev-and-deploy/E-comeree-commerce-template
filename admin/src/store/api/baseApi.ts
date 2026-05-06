import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Bare base query — sends cookies automatically via credentials: "include".
// No Authorization header needed; the accessToken cookie is HTTP-only and
// is attached by the browser on every request to the same origin.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
});

// Mutex so parallel 401s don't trigger multiple simultaneous refreshes
let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

function drainQueue() {
  refreshQueue.forEach((resolve) => resolve());
  refreshQueue = [];
}

/**
 * Wraps rawBaseQuery with an automatic token-refresh + retry flow:
 *
 *  1. Execute the original request.
 *  2. If it returns 401 and we're NOT already refreshing, call POST /auth/refresh.
 *     The server reads the refreshToken cookie, rotates both tokens, and sets
 *     fresh cookies in its response.
 *  3. Retry the original request (now with the new accessToken cookie).
 *  4. If the refresh call itself fails, dispatch logout() and abort.
 *  5. If another request 401s while a refresh is in flight, queue it and retry
 *     after the refresh resolves.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait for any in-progress refresh before sending this request
  if (isRefreshing) {
    await new Promise<void>((resolve) => refreshQueue.push(resolve));
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) return result;

  // ── 401 received ─────────────────────────────────────────────────────────

  if (isRefreshing) {
    // Another call started a refresh while we were waiting; just retry
    return rawBaseQuery(args, api, extraOptions);
  }

  isRefreshing = true;

  const refreshResult = await rawBaseQuery(
    { url: "/auth/refresh", method: "POST" },
    api,
    extraOptions
  );

  isRefreshing = false;

  if (refreshResult.error) {
    // Refresh token expired / revoked — force logout
    drainQueue();
    api.dispatch(logout());
    return refreshResult;
  }

  // New cookies set by the server; drain the queue so queued requests retry
  drainQueue();

  // Retry the original request with the fresh accessToken cookie
  result = await rawBaseQuery(args, api, extraOptions);
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Dashboard",
    "Products",
    "Categories",
    "Orders",
    "Users",
    "Theme",
    "Templates",
    "Campaigns",
    "Discounts",
    "Blogs",
    "Settings",
    "Admins",
  ],
  endpoints: () => ({}),
});
