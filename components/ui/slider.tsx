"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "@/lib/utils";

export interface SliderProps {
  className?: string;
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number[]) => void;
  onValueCommitted?: (value: number[]) => void;
  "aria-label"?: string;
}

export function Slider({
  className,
  value,
  defaultValue = [0],
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onValueChange,
  onValueCommitted,
  ...props
}: SliderProps) {
  const thumbCount = Array.isArray(value)
    ? value.length
    : Array.isArray(defaultValue)
    ? defaultValue.length
    : 1;

  return (
    <SliderPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={(val: any) => {
        if (onValueChange) {
          onValueChange(Array.isArray(val) ? val : [val]);
        }
      }}
      onValueCommitted={(val: any) => {
        if (onValueCommitted) {
          onValueCommitted(Array.isArray(val) ? val : [val]);
        }
      }}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full items-center py-2.5 cursor-pointer">
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Indicator className="absolute h-full bg-primary rounded-full" />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbCount }).map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            index={index}
            className="block size-4.5 rounded-full border-2 border-primary bg-background shadow-md transition-[transform,shadow] hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}
