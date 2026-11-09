import { Resource } from "@/types/Enums/Resource";
import type { User, UserInput } from "@/types/user";
import { apiInstance } from "@/Utils/api/client";
import { isRecord } from "@/Utils/api/response";

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

export async function getUsers(signal?: AbortSignal) {
  const { data } = await apiInstance.get<unknown>("/" + Resource.Users, { signal });
  if (!Array.isArray(data)) throw new Error("Unexpected user list response");
  return data.map(toUser);
}

export async function postUser(input: UserInput) {
  const { firstName, lastName, username, email, phone, password } = input;
  // The public mock dereferences address.geolocation when building its response.
  const address = {
    city: "",
    street: "",
    number: 0,
    zipcode: "",
    geolocation: { lat: "", long: "" },
  };
  const { data } = await apiInstance.post<unknown>("/" + Resource.Users, {
    firstname: firstName,
    lastname: lastName,
    username,
    email,
    phone,
    password,
    address,
    number: address.number,
    zipcode: address.zipcode,
  });
  return toUser(data);
}
