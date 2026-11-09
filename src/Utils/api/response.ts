import axios from "axios";
import type { Product } from "@/types/product";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isProduct(value: unknown): value is Product {
  if (!isRecord(value)) return false;
  const { id, title, description, price, category, image, rating } = value;
  return (
    typeof id === "number" &&
    Number.isSafeInteger(id) &&
    typeof title === "string" &&
    typeof description === "string" &&
    typeof price === "number" &&
    Number.isFinite(price) &&
    price >= 0 &&
    typeof category === "string" &&
    typeof image === "string" &&
    (rating === undefined ||
      (isRecord(rating) && typeof rating.rate === "number" && typeof rating.count === "number"))
  );
}

export function parseList<T>(data: unknown, isItem: (value: unknown) => value is T): T[] {
  if (!Array.isArray(data) || !data.every(isItem)) throw new Error("Unexpected API response");
  return data;
}

export function isCategory(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function getRequestError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return "credentials";
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") return "timeout";
  }
  return "request";
}
