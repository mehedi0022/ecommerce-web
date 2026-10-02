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
      className={`container mx-auto w-full px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
}
