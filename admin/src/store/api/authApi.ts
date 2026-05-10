import { baseApi } from "./baseApi";
import type { User } from "../slices/authSlice";

// Server now returns only the user in the response body.
// Both access and refresh tokens are set as HTTP-only cookies by the server.
export interface LoginResponse {
  user: User;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ data: LoginResponse }, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    // POST /auth/logout — server clears both token cookies
    logout: builder.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    // GET /auth/me — verifies the accessToken cookie, returns the current user
    me: builder.query<{ data: User }, void>({
      query: () => "/auth/me",
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useMeQuery } = authApi;
