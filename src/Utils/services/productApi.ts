import { Resource } from "@/types/Enums/Resource";
import type { ProductInput } from "@/types/product";
import { apiInstance } from "@/Utils/api/client";
import {
  assertWriteResponse,
  isCategory,
  isProduct,
  parseList,
  readRecordId,
} from "@/Utils/api/response";

const path = "/" + Resource.Products;

export async function getProducts(category = "") {
  const { data } = await apiInstance.get<unknown>(
    category ? path + "/category/" + encodeURIComponent(category) : path
  );
  return parseList(data, isProduct);
}

export async function getProduct(id: number) {
  const { data } = await apiInstance.get<unknown>(path + "/" + id);
  if (!isProduct(data) || data.id !== id) throw new Error("Unexpected product details");
  return data;
}

export async function getCategories() {
  const { data } = await apiInstance.get<unknown>(path + "/categories");
  return parseList(data, isCategory);
}

export async function saveProduct(input: ProductInput, id?: number) {
  const payload = {
    ...input,
    image: input.image.startsWith("data:") ? "https://placehold.co/400x400.png" : input.image,
  };
  const { data } =
    id === undefined
      ? await apiInstance.post<unknown>(path, payload)
      : await apiInstance.put<unknown>(path + "/" + id, payload);
  assertWriteResponse(data);
  const recordId = readRecordId(data);
  if (id !== undefined && recordId !== id) throw new Error("Unexpected product identifier");
  const item = isProduct(data) ? data : { ...input, id: recordId };
  return { ...item, image: input.image };
}
