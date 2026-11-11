import { getSession } from "@/Storage/session";
import type { Product } from "@/types/product";
import type { User } from "@/types/user";

export interface RecordChange<T> {
  readonly key: string;
  readonly item: T | null;
}
export interface Records {
  readonly products: RecordChange<Product>[];
  readonly users: RecordChange<User>[];
}
export const EMPTY_RECORDS: Records = { products: [], users: [] };
const KEY = "nova-admin-changes";

export function readRecords(): Records {
  try {
    if (!getSession()) return EMPTY_RECORDS;
    const value = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    if (Array.isArray(value?.products) && Array.isArray(value?.users)) return value;
  } catch {
    // Ignore damaged demo storage.
  }
  return EMPTY_RECORDS;
}

export function writeRecords(records: Records) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

export function clearRecords() {
  sessionStorage.removeItem(KEY);
}

export function mergeRecords<T extends { readonly id: number }>(
  items: readonly T[],
  changes: readonly RecordChange<T>[],
  includeFilteredEdits = false
) {
  const byKey = new Map(changes.map((change) => [change.key, change.item]));
  const rows = changes.flatMap(({ key, item }) =>
    key.startsWith("local:") && item ? [{ key, item }] : []
  );
  for (const item of items) {
    const key = "api:" + item.id;
    const current = byKey.get(key);
    if (current !== null) rows.push({ key, item: current ?? item });
  }
  if (includeFilteredEdits) {
    const present = new Set(items.map((item) => "api:" + item.id));
    for (const { key, item } of changes) {
      if (key.startsWith("api:") && item && !present.has(key)) rows.push({ key, item });
    }
  }
  return rows;
}
