export const CURRENCIES = [
  { code: "USD", symbol: "$",  name: "US Dollar" },
  { code: "EUR", symbol: "€",  name: "Euro" },
  { code: "GBP", symbol: "£",  name: "British Pound" },
  { code: "JPY", symbol: "¥",  name: "Japanese Yen" },
  { code: "PHP", symbol: "₱",  name: "Philippine Peso" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "INR", symbol: "₹",  name: "Indian Rupee" },
  { code: "KRW", symbol: "₩",  name: "South Korean Won" },
  { code: "CNY", symbol: "¥",  name: "Chinese Yuan" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "THB", symbol: "฿",  name: "Thai Baht" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];

export function formatAmount(amount: number, symbol: string): string {
  return `${symbol}${amount.toFixed(2)}`;
}
