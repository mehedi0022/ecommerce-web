"use client";

import { useState, useEffect, useCallback } from "react";
import {
  InvoiceSettings,
  DEFAULT_INVOICE_SETTINGS,
  getInvoiceSettings,
  saveInvoiceSettings,
  resetInvoiceSettings,
  SETTINGS_CHANGE_EVENT,
} from "./invoiceSettings";
import {
  useGetInvoiceSettingsQuery,
  useUpdateInvoiceSettingsMutation,
  useResetInvoiceSettingsMutation,
} from "./invoiceSettingsApi";

export function useInvoiceSettings() {
  const { data: apiResponse, isLoading, isFetching } = useGetInvoiceSettingsQuery();
  const [updateMutation, { isLoading: isUpdating }] = useUpdateInvoiceSettingsMutation();
  const [resetMutation, { isLoading: isResetting }] = useResetInvoiceSettingsMutation();

  const [settings, setSettings] = useState<InvoiceSettings>(() => {
    return getInvoiceSettings();
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // When API loads data from database, update local state & cache
  useEffect(() => {
    if (apiResponse?.data) {
      setSettings(apiResponse.data);
      saveInvoiceSettings(apiResponse.data);
      setIsLoaded(true);
    }
  }, [apiResponse]);

  useEffect(() => {
    // Initial mount cache check
    const cached = getInvoiceSettings();
    if (cached) {
      setSettings(cached);
    }
    setIsLoaded(true);

    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<InvoiceSettings>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      } else {
        setSettings(getInvoiceSettings());
      }
    };

    window.addEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);
    window.addEventListener("storage", handleSettingsChange);

    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);
      window.removeEventListener("storage", handleSettingsChange);
    };
  }, []);

  const updateSettings = useCallback(
    async (newValues: Partial<InvoiceSettings>) => {
      // 1. Save locally for instant UI update
      const localResult = saveInvoiceSettings(newValues);
      setSettings(localResult);

      // 2. Persist to PostgreSQL database via API
      try {
        const res = await updateMutation(newValues).unwrap();
        if (res?.data) {
          saveInvoiceSettings(res.data);
          setSettings(res.data);
          return res.data;
        }
      } catch (err) {
        console.warn("Backend API sync warning (saved locally):", err);
      }

      return localResult;
    },
    [updateMutation]
  );

  const resetToDefaults = useCallback(async () => {
    const localResult = resetInvoiceSettings();
    setSettings(localResult);

    try {
      const res = await resetMutation().unwrap();
      if (res?.data) {
        saveInvoiceSettings(res.data);
        setSettings(res.data);
        return res.data;
      }
    } catch (err) {
      console.warn("Backend API reset warning (reset locally):", err);
    }

    return localResult;
  }, [resetMutation]);

  return {
    settings,
    isLoaded: isLoaded && !isLoading,
    isLoading: isLoading || isFetching,
    isSaving: isUpdating || isResetting,
    updateSettings,
    resetToDefaults,
  };
}
