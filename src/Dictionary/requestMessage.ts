import type { Messages } from "@/Dictionary/messages";
import { getRequestError } from "@/Utils/api/response";

export function requestMessage(error: unknown, m: Messages, fallback: string) {
  switch (getRequestError(error)) {
    case "unauthorized":
      return m.sessionExpired;
    case "forbidden":
      return m.forbidden;
    case "validation":
      return m.reviewForm;
    case "network":
      return m.networkFailure;
    case "timeout":
      return m.requestTimeout;
    default:
      return fallback;
  }
}
