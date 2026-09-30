import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ApiErrorResponse } from "@/types/api.types";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const queryError = error as FetchBaseQueryError;

    if (
      typeof queryError.data === "object" &&
      queryError.data !== null &&
      "message" in queryError.data
    ) {
      return (queryError.data as ApiErrorResponse).message;
    }
  }

  return fallback;
}
