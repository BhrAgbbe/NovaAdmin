import styled, { css } from "styled-components";
import type { ComponentPropsWithoutRef } from "react";
import { Link } from "react-router-dom";
import Icon, { type IconName } from "./Icon";

type Kind = "primary" | "secondary" | "quiet";
const backgrounds: Record<Kind, string> = {
  primary: "var(--brand)",
  secondary: "var(--surface)",
  quiet: "var(--soft)",
};
const buttonStyles = css<{ $kind?: Kind }>`
  border: 1px solid ${({ $kind }) => ($kind === "secondary" ? "var(--line)" : "transparent")};
  border-radius: 10px;
  min-height: 44px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: ${({ $kind }) => (!$kind || $kind === "primary" ? "var(--on-brand)" : "var(--ink)")};
  background: ${({ $kind }) => backgrounds[$kind ?? "primary"]};
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
  &:hover:not(:disabled) {
    filter: brightness(0.96);
  }
  &:disabled {
    background: var(--soft);
    color: var(--muted);
    cursor: not-allowed;
  }
`;
export const Button = styled.button<{ $kind?: Kind }>`
  ${buttonStyles}
`;
export const ButtonLink = styled(Link)<{ $kind?: Kind }>`
  ${buttonStyles}
`;

export const IconButton = styled(Button).attrs({ $kind: "secondary" })`
  padding: 0;
  width: 44px;
`;

const Wordmark = styled.span<{ $inverse?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  direction: ltr;
  color: ${({ $inverse }) => ($inverse ? "white" : "var(--ink)")};
  font:
    700 27px/1.38 Inter,
    sans-serif;
  .nova-icon {
    color: ${({ $inverse }) => ($inverse ? "#FF8544" : "var(--brand-ink)")};
  }
  small {
    font-size: 11px;
    color: ${({ $inverse }) => ($inverse ? "#BAC8DD" : "var(--muted)")};
  }
`;
export function Brand({ inverse = false }: { readonly inverse?: boolean }) {
  return (
    <Wordmark $inverse={inverse}>
      NOVA <Icon name="bag" size={24} />
    </Wordmark>
  );
}

const Feedback = styled.div<{ $variant: "success" | "error" }>`
  display: flex;
  gap: 10px;
  padding: 14px;
  border-radius: 10px;
  align-items: center;
  color: var(--${({ $variant }) => $variant});
  background: var(--${({ $variant }) => $variant}-bg);
  font-size: 14px;
  strong {
    display: block;
  }
  p {
    font-size: 12px;
    margin-top: 2px;
  }
`;
export function Banner({
  variant = "error",
  title,
  detail,
}: {
  readonly variant?: "success" | "error";
  readonly title: string;
  readonly detail?: string;
}) {
  return (
    <Feedback $variant={variant} role={variant === "error" ? "alert" : "status"}>
      <Icon name={variant === "error" ? "info" : "check"} />
      <div>
        <strong>{title}</strong>
        {detail && <p>{detail}</p>}
      </div>
    </Feedback>
  );
}

export const Tile = styled.span`
  inline-size: 48px;
  block-size: 48px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  color: var(--brand-ink);
  background: var(--tint);
  flex: none;
`;

const State = styled.div`
  padding: 24px;
  display: grid;
  justify-items: center;
  gap: 10px;
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  h2 {
    font-size: 22px;
  }
  p {
    font-size: 14px;
    color: var(--muted);
  }
`;
export function EmptyState({
  icon,
  title,
  detail,
  action,
  onAction,
}: {
  readonly icon: IconName;
  readonly title: string;
  readonly detail: string;
  readonly action: string;
  readonly onAction: () => void;
}) {
  return (
    <State>
      <Tile>
        <Icon name={icon} size={23} />
      </Tile>
      <h2>{title}</h2>
      <p>{detail}</p>
      <Button type="button" $kind="secondary" onClick={onAction}>
        {action}
      </Button>
    </State>
  );
}

const Photo = styled.div`
  display: grid;
  place-items: center;
  width: 64px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  color: var(--muted);
  background: var(--soft);
  img,
  .nova-icon {
    grid-area: 1 / 1;
  }
  img {
    z-index: 1;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
export function Thumbnail({ src, alt, ...rest }: ComponentPropsWithoutRef<"img">) {
  return (
    <Photo>
      <Icon name="image" size={18} />
      {src && (
        <img
          {...rest}
          src={src}
          alt={alt}
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      )}
    </Photo>
  );
}
