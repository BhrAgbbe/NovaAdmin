import { useEffect, useState } from "react";

export function useSettledValue<T>(value: T) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), 250);
    return () => clearTimeout(timer);
  }, [value]);
  return settled;
}
