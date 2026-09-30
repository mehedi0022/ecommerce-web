import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
});

let refreshPromise: Promise<boolean> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) {
    return result;
  }

  // Never try to refresh a failed refresh request itself.
  const requestUrl = typeof args === "string" ? args : args.url;

  if (requestUrl.includes("/auth/refresh")) {
    return result;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
        },
        api,
        extraOptions,
      );

      return !refreshResult.error;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  const refreshed = await refreshPromise;

  if (!refreshed) {
    return result;
  }

  // Browser now has the newly rotated httpOnly cookies.
  result = await rawBaseQuery(args, api, extraOptions);

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: [
    "Auth",
    "User",
    "Product",
    "Category",
    "Brand",
    "Attribute",
    "Inventory",
    "Cart",
    "Wishlist",
    "Address",
    "Shipping",
    "Coupon",
    "Order",
    "Shipment",
    "Review",
    "Return",
    "Refund",
  ],

  endpoints: () => ({}),
});
