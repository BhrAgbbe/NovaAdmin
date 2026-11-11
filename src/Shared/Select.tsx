import styled from "styled-components";
import type { ComponentPropsWithoutRef } from "react";
import Icon from "./Icon";

const Control = styled.span`
  position: relative;
  display: block;
  width: 100%;
  min-width: 0;
  > .nova-icon {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-end: 13px;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
  }
`;

const Field = styled.select`
  width: 100%;
  height: 44px;
  padding-block: 0;
  padding-inline: 12px 38px;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 10px;
  font: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  text-align: start;
  cursor: pointer;
  &:focus-visible {
    border-color: var(--focus);
    outline: 2px solid var(--focus);
    outline-offset: 1px;
  }
  @supports (appearance: base-select) {
    &,
    &::picker(select) {
      appearance: base-select;
    }
    & {
      display: inline-flex;
      align-items: center;
    }
    &::picker-icon {
      display: none;
    }
    &::picker(select) {
      margin-block: 6px;
      padding: 6px;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--surface);
      color: var(--ink);
      box-shadow: 0 12px 32px #07132933;
    }
    option {
      padding: 10px 12px;
      border-radius: 8px;
    }
    option:hover,
    option:focus-visible,
    option:checked {
      background: var(--soft);
      color: var(--ink);
    }
  }
`;

export default function Select(props: ComponentPropsWithoutRef<"select">) {
  return (
    <Control className="select-control">
      <Field {...props} />
      <Icon name="down" size={16} />
    </Control>
  );
}
