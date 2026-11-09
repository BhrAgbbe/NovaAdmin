import { useEffect, useState } from "react";

type Result<T> =
  { readonly status: "loading" | "error" } | { readonly status: "success"; readonly data: T };

export function useRequest<T>(request: (signal: AbortSignal) => Promise<T>) {
  const [result, setResult] = useState<Result<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    void request(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ status: "success", data });
      },
      () => {
        if (!controller.signal.aborted) setResult({ status: "error" });
      }
    );
    return () => controller.abort();
  }, [request, attempt]);

  function retry() {
    setResult({ status: "loading" });
    setAttempt((previous) => previous + 1);
  }

  return { result, retry };
}
