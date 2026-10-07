"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { useListPublicSlidersQuery } from "../../sliderApi";

export function StorefrontHeroSlider() {
  const { data, isLoading } = useListPublicSlidersQuery();
  const sliders = data?.data || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = sliders.length;

  const nextSlide = useCallback(() => {
    if (total > 0) {
      setCurrentIndex((prev) => (prev + 1) % total);
    }
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total > 0) {
      setCurrentIndex((prev) => (prev - 1 + total) % total);
    }
  }, [total]);

  // Autoplay timer
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(interval);
  }, [total, isPaused, nextSlide]);

  // Fallback static hero if no sliders are active
  if (!isLoading && sliders.length === 0) {
    return (
      <section className="border-b bg-muted/40">
        <StoreContainer className="grid min-h-[420px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
              <Sparkles className="size-3.5 text-primary" /> Thoughtfully made essentials
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Everyday pieces, made to last.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Discover considered goods for your wardrobe, workspace and home.
              Simple forms, quality materials and a little more joy in the everyday.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/85"
              >
                Shop all products <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/products?sort=featured"
                className="inline-flex h-11 items-center rounded-lg border bg-background px-5 text-sm font-semibold transition hover:bg-muted"
              >
                Explore featured
              </Link>
            </div>
          </div>
          <div className="relative hidden min-h-[300px] overflow-hidden rounded-2xl bg-primary p-8 text-primary-foreground lg:flex lg:items-end">
            <div className="absolute -right-16 -top-20 size-72 rounded-full border-[32px] border-primary-foreground/10" />
            <div className="absolute bottom-8 right-16 size-40 rounded-full bg-primary-foreground/10" />
            <div className="relative max-w-xs">
              <p className="text-sm text-primary-foreground/70">The new edit</p>
              <p className="mt-2 text-3xl font-bold leading-tight">Small upgrades for a better everyday.</p>
            </div>
          </div>
        </StoreContainer>
      </section>
    );
  }

  const current = sliders[currentIndex] || sliders[0];

  return (
    <section
      className="relative overflow-hidden border-b bg-neutral-950 text-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[580px] w-full flex items-center">
        {/* Background Banner Image */}
        {sliders.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {s.imageUrl && (
              <picture className="w-full h-full">
                {s.mobileImage && (
                  <source media="(max-width: 640px)" srcSet={s.mobileImage} />
                )}
                <img
                  src={s.imageUrl}
                  alt={s.title}
                  className="w-full h-full object-cover object-center brightness-[0.62]"
                />
              </picture>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
          </div>
        ))}

        {/* Foreground Content */}
        <StoreContainer className="relative z-20 py-16 sm:py-20 lg:py-24">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide backdrop-blur-md uppercase text-primary-foreground">
              <Sparkles className="size-3.5 text-amber-300" /> Featured Promotion
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-md">
              {current?.title}
            </h1>

            {current?.subtitle && (
              <p className="text-sm sm:text-base lg:text-lg text-white/85 max-w-xl leading-relaxed drop-shadow-xs">
                {current.subtitle}
              </p>
            )}

            {current?.buttonText && (
              <div className="pt-2">
                <Link
                  href={current.buttonUrl || "/products"}
                  className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-primary px-7 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90"
                >
                  {current.buttonText} <ArrowRight className="size-4" />
                </Link>
              </div>
            )}
          </div>
        </StoreContainer>

        {/* Carousel Controls (if multiple slides) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex size-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/75 hover:scale-110 cursor-pointer"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex size-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/75 hover:scale-110 cursor-pointer"
            >
              <ChevronRight className="size-6" />
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              {sliders.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? "w-8 bg-primary shadow-sm"
                      : "w-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
