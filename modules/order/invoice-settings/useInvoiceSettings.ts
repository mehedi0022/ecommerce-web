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

export function useInvoiceSettings() {
  const [settings, setSettings] = useState<InvoiceSettings>(() => {
    return getInvoiceSettings();
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load from localStorage on client mount
    setSettings(getInvoiceSettings());
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
    (newValues: Partial<InvoiceSettings>) => {
      const result = saveInvoiceSettings(newValues);
      setSettings(result);
      return result;
    },
    []
  );

  const resetToDefaults = useCallback(() => {
    const result = resetInvoiceSettings();
    setSettings(result);
    return result;
  }, []);

  return {
    settings,
    isLoaded,
    updateSettings,
    resetToDefaults,
  };
}
