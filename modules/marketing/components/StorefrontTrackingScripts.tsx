"use client";

import React, { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useGetPublicMarketingSettingsQuery } from "../marketingApi";

export function StorefrontTrackingScripts() {
  const { data: settingsData } = useGetPublicMarketingSettingsQuery();
  const pathname = usePathname();
  const settings = settingsData?.data;

  // Track PageView on route change
  useEffect(() => {
    if (!settings) return;

    // 1. Meta Pixel PageView
    if (settings.facebook?.enabled && typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }

    // 2. TikTok PageView
    if (settings.tiktok?.enabled && typeof window !== "undefined" && window.ttq && typeof window.ttq.page === "function") {
      window.ttq.page();
    }

    // 3. Google Tag Manager / GA4 PageView
    if (settings.google?.enabled && typeof window !== "undefined" && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: "page_view",
        page_path: pathname,
      });
    }
  }, [pathname, settings]);

  if (!settings) return null;

  const fbEnabled = Boolean(settings.facebook?.enabled && settings.facebook?.pixelId);
  const fbPixelId = settings.facebook?.pixelId?.trim();

  const gtmEnabled = Boolean(settings.google?.enabled && settings.google?.gtmContainerId);
  const gtmId = settings.google?.gtmContainerId?.trim();

  const ga4Enabled = Boolean(settings.google?.enabled && !gtmEnabled && settings.google?.ga4MeasurementId);
  const ga4Id = settings.google?.ga4MeasurementId?.trim();

  const tiktokEnabled = Boolean(settings.tiktok?.enabled && settings.tiktok?.pixelId);
  const tiktokId = settings.tiktok?.pixelId?.trim();

  return (
    <>
      {/* ─── Meta / Facebook Pixel ───────────────────────────────────────────── */}
      {fbEnabled && fbPixelId && (
        <>
          <Script id="facebook-pixel-init" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* ─── Google Tag Manager (GTM) ───────────────────────────────────────── */}
      {gtmEnabled && gtmId && (
        <>
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* ─── Google Analytics 4 (Direct GA4 if GTM not used) ───────────────── */}
      {ga4Enabled && ga4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}', { page_path: window.location.pathname });
            `}
          </Script>
        </>
      )}

      {/* ─── TikTok Pixel ──────────────────────────────────────────────────── */}
      {tiktokEnabled && tiktokId && (
        <Script id="tiktok-pixel-init" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
              var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
              ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load('${tiktokId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}
    </>
  );
}
