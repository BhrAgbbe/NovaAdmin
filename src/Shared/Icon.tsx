import type { CSSProperties } from "react";

export type IconName =
  | "bag"
  | "search"
  | "sun"
  | "moon"
  | "globe"
  | "menu"
  | "box"
  | "users"
  | "logout"
  | "lock"
  | "eye"
  | "plus"
  | "minus"
  | "check"
  | "x"
  | "chevron"
  | "down"
  | "arrow"
  | "trash"
  | "star"
  | "shirt"
  | "laptop"
  | "gem"
  | "mail"
  | "image"
  | "info"
  | "refresh"
  | "shield"
  | "grid";

interface Props {
  readonly name: IconName;
  readonly size?: number;
  readonly directional?: boolean;
}

export default function Icon({ name, size = 20, directional = false }: Props) {
  return (
    <span
      aria-hidden="true"
      className={directional ? "nova-icon directional" : "nova-icon"}
      data-icon={name}
      style={{ fontSize: size } as CSSProperties}
    />
  );
}
