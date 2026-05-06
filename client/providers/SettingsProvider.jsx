"use client";
import { createContext, useContext } from "react";

const SYMBOL_MAP = {
  USD: "$", EUR: "€", GBP: "£", INR: "₹",
  JPY: "¥", CAD: "CA$", AUD: "A$", AED: "AED", SGD: "S$",
};

const defaultSettings = {
  currency: "USD",
  currencySymbol: "$",
  taxRate: 10,
  freeShippingThreshold: 0,
  siteTitle: "MyStore",
  contactEmail: "",
  allowGuestCheckout: true,
};

const SettingsContext = createContext(defaultSettings);

export function SettingsProvider({ settings, children }) {
  const raw = settings || {};
  const currency = raw.currency || "USD";
  const value = {
    currency,
    currencySymbol: SYMBOL_MAP[currency] ?? "$",
    taxRate: parseFloat(raw.taxRate ?? "10"),
    freeShippingThreshold: parseFloat(raw.freeShippingThreshold ?? "0"),
    siteTitle: raw.siteTitle || "MyStore",
    contactEmail: raw.contactEmail || "",
    allowGuestCheckout: raw.allowGuestCheckout !== "false",
  };
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
