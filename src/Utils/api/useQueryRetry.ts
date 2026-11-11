import { isCancelledError, type RefetchOptions } from "@tanstack/react-query";
import { useMessages } from "@/Dictionary/messages";
import { requestMessage } from "@/Dictionary/requestMessage";
import { useDismissToast, useToast } from "@/Shared/Toast";
import { getSession } from "@/Storage/session";

export function useQueryRetry() {
  const { m } = useMessages();
  const toast = useToast();
  const dismiss = useDismissToast();

  return async function retry(
    refetch: (options: RefetchOptions) => Promise<unknown>,
    fallback: string
  ) {
    const session = getSession();
    const notice = toast(m.loading, "pending");
    try {
      await refetch({ throwOnError: true, cancelRefetch: false });
      if (getSession() === session) toast(m.loaded, "success", notice);
      else dismiss(notice);
    } catch (error) {
      if (isCancelledError(error) || getSession() !== session) dismiss(notice);
      else toast(requestMessage(error, m, fallback), "error", notice);
    }
  };
}
