import type { Locale } from "@/Utils/format";

export type Mode = "light" | "dark";

export function readPreference(key: "locale"): Locale;
export function readPreference(key: "theme"): Mode;
export function readPreference(key: "locale" | "theme") {
  try {
    const value = localStorage.getItem("nova-admin:" + key);
    if (key === "locale") return value === "en" ? "en" : "fa";
    return value === "dark" ? "dark" : "light";
  } catch {
    return key === "locale" ? "fa" : "light";
  }
}

export function writePreference(key: "locale" | "theme", value: Locale | Mode) {
  try {
    localStorage.setItem("nova-admin:" + key, value);
  } catch {
    // Preferences still work in memory when browser storage is disabled.
  }
}
