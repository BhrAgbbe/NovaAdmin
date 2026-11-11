import type { Resource } from "@/types/Enums/Resource";
import { apiInstance } from "@/Utils/api/client";
import { assertWriteResponse, readRecordId } from "@/Utils/api/response";

export async function deleteRecord(resource: Resource, id: number) {
  const { data } = await apiInstance.delete<unknown>("/" + resource + "/" + id);
  assertWriteResponse(data);
  if (readRecordId(data) !== id) throw new Error("Unexpected deleted record identifier");
}
