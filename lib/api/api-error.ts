import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ApiErrorResponse } from "@/types/api.types";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
) {
  if (!error || typeof error !== "object") return fallback;
  const value = error as FetchBaseQueryError;
  if (
    typeof value.data === "object" &&
    value.data !== null &&
    "message" in value.data
  ) {
    const data = value.data as ApiErrorResponse;
    return data.message || fallback;
  }
  if ("error" in value && typeof value.error === "string") return value.error;
  return fallback;
}

export function getApiValidationDetails(error: unknown) {
  if (!error || typeof error !== "object") return [];
  const value = error as FetchBaseQueryError;
  if (
    typeof value.data === "object" &&
    value.data !== null &&
    "details" in value.data
  ) {
    const details = (value.data as ApiErrorResponse).details;
    return details ?? [];
  }
  return [];
}
