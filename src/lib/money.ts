import type { Money, CurrencyCode } from "@/lib/types";

const SYMBOLS: Record<CurrencyCode, string> = { PHP: "₱", USD: "$" };

export function money(amountMinor: number, currency: CurrencyCode = "PHP"): Money {
  return { amountMinor, currency };
}

export function formatMoney(m: Money, opts?: { withDecimals?: boolean }): string {
  const symbol = SYMBOLS[m.currency];
  const major = m.amountMinor / 100;
  const formatted = major.toLocaleString("en-PH", {
    minimumFractionDigits: opts?.withDecimals ? 2 : 0,
    maximumFractionDigits: opts?.withDecimals ? 2 : 0,
  });
  return `${symbol}${formatted}`;
}

export function incomeToRent(incomeMinor: number, rentMinor: number): number {
  if (rentMinor <= 0) return 0;
  return Math.round((incomeMinor / rentMinor) * 10) / 10;
}
