export type Locale = "fa" | "en";

export const localeTag = { fa: "fa-IR", en: "en-US" } as const;

export function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(localeTag[locale], { maximumFractionDigits: 2 }).format(value);
}

export function formatPrice(value: number, locale: Locale) {
  return formatNumber(value, locale) + (locale === "fa" ? " تومان" : " toman");
}

export function normalizeDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => String(digit.charCodeAt(0) % 16));
}

export function normalizeSearch(value: string) {
  return normalizeDigits(value).trim().toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک");
}

export function isImageUrl(value: string) {
  try {
    return ["https:", "http:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
