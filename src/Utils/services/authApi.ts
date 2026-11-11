import { apiInstance } from "@/Utils/api/client";
import { assertWriteResponse, isRecord } from "@/Utils/api/response";
import type { LoginInput } from "@/types/user";

export async function postLogin(payload: LoginInput) {
  const { data } = await apiInstance.post<unknown>("/auth/login", payload);
  assertWriteResponse(data);
  if (!isRecord(data) || typeof data.token !== "string" || !data.token.trim()) {
    throw new Error("Missing session token");
  }
  return data.token;
}
