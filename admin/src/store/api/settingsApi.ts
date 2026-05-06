import { baseApi } from "./baseApi";

export interface StoreSettings {
  currency: string;
  taxRate: string;
  freeShippingThreshold: string;
  siteTitle: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: string;
  emailNotifications: string;
  lowStockThreshold: string;
  allowGuestCheckout: string;
  [key: string]: string;
}

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<{ data: StoreSettings }, void>({
      query: () => "/settings",
      providesTags: ["Settings"],
    }),
    updateSetting: builder.mutation<void, { key: string; value: string }>({
      query: (body) => ({ url: "/settings", method: "PATCH", body }),
      invalidatesTags: ["Settings"],
    }),
    saveSettings: builder.mutation<void, { settings: { key: string; value: string }[] }>({
      query: (body) => ({ url: "/settings", method: "PUT", body }),
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingMutation,
  useSaveSettingsMutation,
} = settingsApi;
