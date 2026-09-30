import type { ReactNode } from "react";

interface StoreContainerProps {
  children: ReactNode;
  className?: string;
}

export function StoreContainer({
  children,
  className = "",
}: StoreContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
