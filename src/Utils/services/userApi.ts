import { Resource } from "@/types/Enums/Resource";
import type { User, UserInput } from "@/types/user";
import { apiInstance } from "@/Utils/api/client";
import { assertWriteResponse, isRecord, readRecordId } from "@/Utils/api/response";

const path = "/" + Resource.Users;

function toUser(data: unknown): User {
  if (!isRecord(data) || !isRecord(data.name)) throw new Error("Unexpected user response");
  const { id, username, email, phone, name } = data;
  if (
    typeof id !== "number" ||
    !Number.isSafeInteger(id) ||
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof name.firstname !== "string" ||
    typeof name.lastname !== "string"
  ) {
    throw new Error("Unexpected user fields");
  }
  return { id, username, email, phone, firstName: name.firstname, lastName: name.lastname };
}

export async function getUsers() {
  const { data } = await apiInstance.get<unknown>(path);
  if (!Array.isArray(data)) throw new Error("Unexpected user list response");
  return data.map(toUser);
}

export async function getUser(id: number) {
  const { data } = await apiInstance.get<unknown>(path + "/" + id);
  const user = toUser(data);
  if (user.id !== id) throw new Error("Unexpected user identifier");
  return user;
}

export async function saveUser(input: UserInput, id?: number) {
  const { firstName, lastName, username, email, phone, password } = input;
  // The public mock dereferences address.geolocation when building its response.
  const address = {
    city: "",
    street: "",
    number: 0,
    zipcode: "",
    geolocation: { lat: "", long: "" },
  };
  const payload = {
    firstname: firstName,
    lastname: lastName,
    username,
    email,
    phone,
    ...(password ? { password } : {}),
    address,
    number: address.number,
    zipcode: address.zipcode,
  };
  const { data } =
    id === undefined
      ? await apiInstance.post<unknown>(path, payload)
      : await apiInstance.put<unknown>(path + "/" + id, payload);
  assertWriteResponse(data);
  // The hosted PUT endpoint may echo the flat form body without an id.
  if (
    id !== undefined &&
    isRecord(data) &&
    !("id" in data) &&
    data.firstname === firstName &&
    data.lastname === lastName &&
    data.username === username &&
    data.email === email &&
    data.phone === phone
  )
    return { id, firstName, lastName, username, email, phone };

  const recordId = readRecordId(data);
  if (id !== undefined && recordId !== id) throw new Error("Unexpected user identifier");
  if (isRecord(data) && isRecord(data.name)) return toUser(data);
  return { id: recordId, firstName, lastName, username, email, phone };
}
