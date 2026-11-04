import { baseApi } from "@/redux/baseApi";

export interface FacebookConfig {
  enabled: boolean;
  pixelId: string;
  capiEnabled: boolean;
  accessToken: string;
  testEventCode?: string;
}

export interface GoogleConfig {
  enabled: boolean;
  gtmContainerId: string;
  ga4MeasurementId: string;
  googleAdsConversionId?: string;
  googleAdsConversionLabel?: string;
}

export interface TikTokConfig {
  enabled: boolean;
  pixelId: string;
  eventsApiEnabled: boolean;
  accessToken?: string;
  testEventCode?: string;
}

export interface TrackingPreferences {
  trackPageView: boolean;
  trackViewContent: boolean;
  trackAddToCart: boolean;
  trackInitiateCheckout: boolean;
  trackPurchase: boolean;
  deduplicationPrefix: string;
}

export interface MarketingSettings {
  facebook: FacebookConfig;
  google: GoogleConfig;
  tiktok: TikTokConfig;
  trackingPreferences: TrackingPreferences;
}

export interface PublicMarketingSettings {
  facebook: {
    enabled: boolean;
    pixelId: string;
    capiEnabled: boolean;
  };
  google: {
    enabled: boolean;
    gtmContainerId: string;
    ga4MeasurementId: string;
    googleAdsConversionId?: string;
    googleAdsConversionLabel?: string;
  };
  tiktok: {
    enabled: boolean;
    pixelId: string;
    eventsApiEnabled: boolean;
  };
  trackingPreferences: TrackingPreferences;
}

export const marketingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMarketingSettings: builder.query<{ success: boolean; data: MarketingSettings }, void>({
      query: () => "/marketing",
      providesTags: ["Marketing"],
    }),
    getPublicMarketingSettings: builder.query<{ success: boolean; data: PublicMarketingSettings }, void>({
      query: () => "/marketing/public",
      providesTags: ["Marketing"],
    }),
    updateMarketingSettings: builder.mutation<
      { success: boolean; message: string; data: MarketingSettings },
      Partial<MarketingSettings>
    >({
      query: (body) => ({
        url: "/marketing",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Marketing"],
    }),
    testMetaCapi: builder.mutation<
      { success: boolean; message: string; data: any },
      { pixelId: string; accessToken: string; testEventCode: string }
    >({
      query: (body) => ({
        url: "/marketing/test-meta",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetMarketingSettingsQuery,
  useGetPublicMarketingSettingsQuery,
  useUpdateMarketingSettingsMutation,
  useTestMetaCapiMutation,
} = marketingApi;
