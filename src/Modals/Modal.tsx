import { useEffect, useId, useRef, type ReactNode } from "react";
import { useToastTarget } from "@/Shared/Toast";
import styled from "styled-components";
import Icon from "@/Shared/Icon";
import { IconButton } from "@/Shared/controls";

const Dialog = styled.dialog`
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  margin: auto;
  padding: 22px;
  width: min(460px, calc(100% - 32px));
  max-height: calc(100dvh - 32px);
  &[open] {
    display: flex;
    flex-direction: column;
  }
  &::backdrop {
    background: #0b162bbb;
  }
  &[data-wide="true"] {
    width: min(850px, calc(100% - 32px));
  }
  &[data-drawer="true"] {
    inset: 0;
    margin: 0;
    margin-inline-end: auto;
    width: min(320px, 88vw);
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    overscroll-behavior: contain;
    --drawer-offset: -100%;
    [dir="rtl"] & {
      --drawer-offset: 100%;
    }
    &[open] {
      animation: drawer-in 180ms ease-out;
    }
    &[open]::backdrop {
      animation: backdrop-in 180ms ease-out;
    }
    &[data-closing] {
      animation: drawer-out 180ms ease-in both;
    }
    &[data-closing]::backdrop {
      animation: backdrop-out 180ms ease-in both;
    }
    @media (prefers-reduced-motion: reduce) {
      &[open],
      &[open]::backdrop {
        animation: none;
      }
    }
  }
  @keyframes drawer-in {
    from {
      transform: translateX(var(--drawer-offset));
    }
    to {
      transform: translateX(0);
    }
  }
  @keyframes backdrop-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes drawer-out {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(var(--drawer-offset));
    }
  }
  @keyframes backdrop-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  box-shadow: 0 16px 52px #07132955;
  overflow-wrap: anywhere;
  & > header {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-block-end: 16px;
  }
  & > header h2 {
    font-size: 20px;
  }
  & > header button {
    color: inherit;
    background: transparent;
    border: 0;
    min-width: 44px;
    flex: none;
    min-height: 44px;
    &:hover {
      background: var(--soft);
    }
  }
  & > .dialog-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-block-start: 18px;
  }
`;

interface Props {
  readonly title: string;
  readonly closeLabel: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly wide?: boolean;
  readonly drawer?: boolean;
  readonly busy?: boolean;
}

export default function Modal({ title, closeLabel, onClose, children, wide, drawer, busy }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const setToastTarget = useToastTarget();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function requestClose() {
    const dialog = ref.current;
    if (!dialog || busy || dialog.querySelector('form[aria-busy="true"]') || closeTimer.current)
      return;
    if (!drawer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    dialog.dataset.closing = "true";
    closeTimer.current = setTimeout(onClose, 180);
  }

  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement;
    if (!dialog) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.querySelector<HTMLElement>("[data-initial-focus]")?.focus();
    setToastTarget(dialog);
    return () => {
      clearTimeout(closeTimer.current);
      closeTimer.current = undefined;
      setToastTarget(null);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, [setToastTarget]);

  return (
    <Dialog
      ref={ref}
      aria-labelledby={id}
      data-wide={wide}
      data-drawer={drawer}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (drawer && event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right) requestClose();
        }
      }}
    >
      <header>
        <h2 id={id}>{title}</h2>
        <IconButton type="button" aria-label={closeLabel} onClick={requestClose} disabled={busy}>
          <Icon name="x" size={25} />
        </IconButton>
      </header>
      <div className="dialog-body">{children}</div>
    </Dialog>
  );
}
