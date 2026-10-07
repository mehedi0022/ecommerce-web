import { withReauth } from "./reauth";
import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    return headers;
  },
  credentials: "include",
});

const baseQueryWithReauth = withReauth(rawBaseQuery);

export const baseApi = createApi({
  reducerPath: "baseApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: [
    "Auth",
    "User",
    "Role",
    "Product",
    "Category",
    "Brand",
    "Attribute",
    "Inventory",
    "InventoryMovement",
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
    "Navigation",
    "Slider",
    "Popup",
    "Payment",
    "Notification",
    "Courier",
    "Setting",
  ],

  endpoints: () => ({}),
});
