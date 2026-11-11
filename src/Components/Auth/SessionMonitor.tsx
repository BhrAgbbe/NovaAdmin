import { useLayoutEffect } from "react";
import { useMessages } from "@/Dictionary/messages";
import { useAppSelector } from "@/Redux/store";
import { useToast } from "@/Shared/Toast";
import { getSession } from "@/Storage/session";
import { apiInstance } from "@/Utils/api/client";
import { getRequestError } from "@/Utils/api/response";
import { endSession } from "@/Utils/endSession";

export default function SessionMonitor() {
  const authenticated = useAppSelector((state) => state.session.authenticated);
  const { m } = useMessages();
  const toast = useToast();

  useLayoutEffect(() => {
    if (!authenticated) return;
    const session = getSession();
    function expire() {
      toast(endSession() ? m.sessionExpired : m.logoutFailed, "error");
    }
    if (!session) {
      expire();
      return;
    }
    const timer = setTimeout(expire, session.expiresAt - Date.now());
    const interceptor = apiInstance.interceptors.response.use(undefined, (error: unknown) => {
      if (getRequestError(error) === "unauthorized" && getSession() === session) expire();
      return Promise.reject(error);
    });
    return () => {
      clearTimeout(timer);
      apiInstance.interceptors.response.eject(interceptor);
    };
  }, [authenticated, m.sessionExpired, m.logoutFailed, toast]);

  return null;
}
