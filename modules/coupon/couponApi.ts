import { baseApi } from "@/redux/baseApi";
import type {
  Coupon,
  CouponApiResponse,
  CouponListApiResponse,
  CouponListQuery,
  CreateCouponInput,
  UpdateCouponInput,
  ValidateCouponApiResponse,
  ValidateCouponInput,
} from "./coupon.types";

export * from "./coupon.types";

export const couponApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    validateCoupon: builder.mutation<
      ValidateCouponApiResponse,
      ValidateCouponInput
    >({
      query: (body) => ({
        url: "/coupons/validate",
        method: "POST",
        body,
      }),
    }),

    listCoupons: builder.query<CouponListApiResponse, CouponListQuery | void>({
      query: (params) => ({
        url: "/admin/coupons",
        params: params || {},
      }),
      providesTags: ["Coupon"],
    }),

    getCoupon: builder.query<CouponApiResponse, number>({
      query: (id) => `/admin/coupons/${id}`,
      providesTags: ["Coupon"],
    }),

    createCoupon: builder.mutation<CouponApiResponse, CreateCouponInput>({
      query: (body) => ({
        url: "/admin/coupons",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Coupon"],
    }),

    updateCoupon: builder.mutation<
      CouponApiResponse,
      { id: number; data: UpdateCouponInput }
    >({
      query: ({ id, data }) => ({
        url: `/admin/coupons/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Coupon"],
    }),

    deleteCoupon: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/admin/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Coupon"],
    }),
  }),
});

export const {
  useValidateCouponMutation,
  useListCouponsQuery,
  useGetCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponApi;
