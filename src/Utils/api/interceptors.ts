import { apiInstance } from "@/Utils/api/client";
import { getSession } from "@/Storage/session";
import { endSession } from "@/Utils/endSession";
import axios from "axios";

export function installInterceptors() {
  apiInstance.interceptors.request.use((config) => {
    const session = getSession();
    const target = new URL(config.url ?? "", config.baseURL);
    const apiOrigin = new URL(apiInstance.defaults.baseURL ?? "", window.location.origin).origin;
    if (session && target.origin === apiOrigin && target.pathname !== "/auth/login") {
      config.headers.set("Authorization", `Bearer ${session.token}`);
    }
    return config;
  });

  apiInstance.interceptors.response.use(undefined, (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const { response, config } = error;
      const session = getSession();
      if (
        session && response?.status === 401 &&
        config?.headers?.get("Authorization") === `Bearer ${session.token}`
      ) endSession();
    }
    return Promise.reject(error);
  });
}
