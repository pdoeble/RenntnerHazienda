export function formatMoney(
  value: number,
  locale = "de-DE",
  currency = "EUR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value: number, locale = "de-DE"): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 2
  }).format(value / 100);
}
