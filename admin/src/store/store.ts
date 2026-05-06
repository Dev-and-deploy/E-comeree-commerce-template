import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import { mockApi } from "./api/mockApi";
import { baseApi } from "./api/baseApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    [mockApi.reducerPath]: mockApi.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(mockApi.middleware, baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
