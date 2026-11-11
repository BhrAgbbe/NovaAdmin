import { useFormikContext } from "formik";
import { useEffect, useRef } from "react";
import { useToast } from "@/Shared/Toast";

export default function FormValidationToast({ message }: { readonly message: string }) {
  const { errors, isValidating, submitCount } = useFormikContext();
  const last = useRef(0);
  const toast = useToast();

  useEffect(() => {
    if (isValidating || !submitCount || submitCount === last.current) return;
    last.current = submitCount;
    if (Object.keys(errors).length) toast(message, "error");
  }, [errors, isValidating, message, submitCount, toast]);

  return null;
}
