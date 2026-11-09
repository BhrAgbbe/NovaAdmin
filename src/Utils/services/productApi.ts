import { Resource } from "@/types/Enums/Resource";
import type { ProductInput } from "@/types/product";
import { apiInstance } from "@/Utils/api/client";
import { isCategory, isProduct, parseList } from "@/Utils/api/response";

export async function getProducts(signal?: AbortSignal) {
  const { data } = await apiInstance.get<unknown>("/" + Resource.Products, { signal });
  return parseList(data, isProduct);
}

export async function getCategories(signal?: AbortSignal) {
  const { data } = await apiInstance.get<unknown>("/" + Resource.Products + "/categories", {
    signal,
  });
  return parseList(data, isCategory);
}

export async function postProduct(payload: ProductInput) {
  const { data } = await apiInstance.post<unknown>("/" + Resource.Products, payload);
  if (!isProduct(data)) throw new Error("Unexpected product response");
  return data;
}
