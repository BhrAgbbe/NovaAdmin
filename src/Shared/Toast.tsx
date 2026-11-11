import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import Icon from "./Icon";
import { Progress } from "./Skeleton";
const slideIn = keyframes`from { transform: translateX(calc(100% + 16px)); opacity: 0; } to { transform: translateX(0); opacity: 1; }`;

type Tone = "pending" | "success" | "error" | "warning" | "info";
interface Message {
  readonly id: number;
  readonly text: string;
  readonly tone: Tone;
}
interface ToastActions {
  readonly notify: (text: string, tone: Tone, id?: number) => number;
  readonly dismiss: (id: number) => void;
}
const ToastContext = createContext<ToastActions | null>(null);
const ToastTargetContext = createContext<(target: HTMLElement | null) => void>(() => {});
const Stack = styled.div`
  position: fixed;
  z-index: 30;
  right: 16px;
  inset-block-end: 16px;
  width: min(360px, calc(100% - 32px));
  display: grid;
  gap: 8px;
  max-height: 40dvh;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
`;
const Notice = styled.div`
  display: flex;
  gap: 12px;
  animation: ${slideIn} 0.24s ease-out;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-inline-start: 4px solid var(--brand-ink, var(--accent, #fb813d));
  border-radius: 10px;
  background: var(--surface);
  color: var(--ink);
  box-shadow: 0 6px 24px #0003;
  &[data-tone="error"] {
    border-inline-start-color: var(--error, #c93434);
  }
  &[data-tone="warning"] {
    border-inline-start-color: var(--brand);
  }
  &[data-tone="info"] {
    border-inline-start-color: var(--focus);
  }
  &[data-tone="success"] {
    border-inline-start-color: var(--success);
  }
  button {
    color: inherit;
    background: transparent;
    border: 0;
    min-width: 44px;
    min-height: 44px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    &:hover {
      background: var(--soft);
    }
  }
`;

export function ToastProvider({
  children,
  closeLabel,
}: {
  children: ReactNode;
  closeLabel: string;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const next = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const activeTimers = timers.current;
    return () => activeTimers.forEach(clearTimeout);
  }, []);

  const dismiss = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setMessages((current) => current.filter((message) => message.id !== id));
  }, []);

  const notify = useCallback(
    (text: string, tone: Tone, id = ++next.current) => {
      const message = { id, text, tone };
      setMessages((current) =>
        [
          ...current.filter(
            (item) =>
              item.id !== id && (tone === "pending" || item.tone !== tone || item.text !== text)
          ),
          message,
        ].slice(-5)
      );
      if (tone !== "pending") {
        clearTimeout(timers.current.get(id));
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), 5000)
        );
      }
      return id;
    },
    [dismiss]
  );

  const actions = useMemo(() => ({ notify, dismiss }), [notify, dismiss]);
  const viewport = (
    <Stack>
      {messages.map(({ id, tone, text }) => (
        <Notice key={id} data-tone={tone}>
          {tone === "pending" && <Progress aria-hidden="true" />}
          <span role={tone === "error" ? "alert" : "status"}>{text}</span>
          {tone !== "pending" && (
            <button type="button" aria-label={closeLabel} onClick={() => dismiss(id)}>
              <Icon name="x" size={22} />
            </button>
          )}
        </Notice>
      ))}
    </Stack>
  );

  return (
    <ToastContext.Provider value={actions}>
      <ToastTargetContext.Provider value={setTarget}>
        {children}
        {target ? createPortal(viewport, target) : viewport}
      </ToastTargetContext.Provider>
    </ToastContext.Provider>
  );
}

function useToastActions() {
  const actions = useContext(ToastContext);
  if (!actions) throw new Error("ToastProvider is required");
  return actions;
}

export function useToast() {
  return useToastActions().notify;
}

export function useDismissToast() {
  return useToastActions().dismiss;
}

export function useToastTarget() {
  return useContext(ToastTargetContext);
}
