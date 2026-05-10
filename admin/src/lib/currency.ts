import { useGetSettingsQuery } from "@/store/api/settingsApi";

export const CURRENCIES = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "INR", label: "Indian Rupee", symbol: "₹" },
  { code: "JPY", label: "Japanese Yen", symbol: "¥" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", label: "Australian Dollar", symbol: "A$" },
  { code: "AED", label: "UAE Dirham", symbol: "AED" },
  { code: "SGD", label: "Singapore Dollar", symbol: "S$" },
];

export const SYMBOL_MAP: Record<string, string> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.symbol])
);

export function useCurrencySymbol(): string {
  const { data } = useGetSettingsQuery();
  return SYMBOL_MAP[data?.data?.currency ?? "USD"] ?? "$";
}

export function formatPrice(amount: number, symbol: string): string {
  return `${symbol}${amount.toFixed(2)}`;
}
