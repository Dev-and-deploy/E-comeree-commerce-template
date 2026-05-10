import { baseApi } from "./baseApi";

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
  items: { id: string; name: string; quantity: number; price: number }[];
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<{ data: Order[]; pagination: object }, { page?: number; status?: string }>({
      query: (params) => ({ url: "/orders", params }),
      providesTags: ["Orders"],
    }),
    getOrder: builder.query<{ data: Order }, string>({
      query: (id) => `/orders/${id}`,
      providesTags: ["Orders"],
    }),
    updateOrderStatus: builder.mutation<{ data: Order }, { id: string; status: string; trackingNumber?: string }>({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: "PATCH", body }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const { useGetOrdersQuery, useGetOrderQuery, useUpdateOrderStatusMutation } = orderApi;
