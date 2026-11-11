import { signedOut, store } from "@/Redux/store";
import { clearRecords } from "@/Storage/records";
import { clearSession } from "@/Storage/session";
import { adminQueryClient } from "@/Utils/api/query";

export function endSession() {
  try {
    clearSession();
    clearRecords();
    return true;
  } catch {
    return false;
  } finally {
    adminQueryClient.clear();
    store.dispatch(signedOut());
  }
}
