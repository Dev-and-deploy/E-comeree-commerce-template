import { baseApi } from "./baseApi";

export interface ThemeSettings {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: string;
  layoutType: string;
  headerStyle: string;
  footerStyle: string;
  productCardStyle: string;
  logoUrl?: string;
  storeName: string;
  isActive: boolean;
  templateId: string;
  template?: { id: string; name: string; slug: string };
  homeSections?: object;
  customCss?: string;
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
}

export const themeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllThemes: builder.query<{ data: ThemeSettings[] }, void>({
      query: () => "/theme",
      providesTags: ["Theme"],
    }),
    getActiveTheme: builder.query<{ data: ThemeSettings }, void>({
      query: () => "/theme/active",
      providesTags: ["Theme"],
    }),
    createTheme: builder.mutation<{ data: ThemeSettings }, Partial<ThemeSettings>>({
      query: (body) => ({ url: "/theme", method: "POST", body }),
      invalidatesTags: ["Theme"],
    }),
    updateTheme: builder.mutation<{ data: ThemeSettings }, Partial<ThemeSettings> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/theme/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Theme"],
    }),
    activateTheme: builder.mutation<{ data: ThemeSettings }, string>({
      query: (id) => ({ url: `/theme/${id}/activate`, method: "POST" }),
      invalidatesTags: ["Theme"],
    }),
    getTemplates: builder.query<{ data: Template[] }, void>({
      query: () => "/theme/templates",
      providesTags: ["Templates"],
    }),
    getAdminSettings: builder.query<{ data: Record<string, string> }, void>({
      query: () => "/theme/settings",
    }),
    updateAdminSetting: builder.mutation<void, { key: string; value: string }>({
      query: (body) => ({ url: "/theme/settings", method: "PATCH", body }),
    }),
  }),
});

export const {
  useGetAllThemesQuery,
  useGetActiveThemeQuery,
  useCreateThemeMutation,
  useUpdateThemeMutation,
  useActivateThemeMutation,
  useGetTemplatesQuery,
  useGetAdminSettingsQuery,
  useUpdateAdminSettingMutation,
} = themeApi;
