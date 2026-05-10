import { baseApi } from "./baseApi";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<{ data: { url: string } }, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return { url: "/upload", method: "POST", body: formData };
      },
    }),
  }),
});

export const { useUploadImageMutation } = uploadApi;
