import { useField } from "formik";
import { useId, useState } from "react";
import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import { normalizePriceInput } from "@/Utils/format";
import Icon from "./Icon";

const Group = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
  position: relative;
  label {
    font-size: 14px;
    font-weight: 700;
  }
  input,
  textarea,
  select {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: var(--surface);
    color: var(--ink);
    min-height: 44px;
    padding: 9px 12px;
    font-size: 14px;
    &::placeholder {
      color: var(--muted);
      opacity: 1;
    }
    &[aria-invalid="true"] {
      border-color: var(--error);
    }
  }
  textarea {
    min-height: 88px;
    resize: vertical;
  }
  .password-input {
    padding-inline-end: 48px;
  }
  [dir="rtl"] & input[dir="ltr"] {
    text-align: right;
  }
  select {
    appearance: none;
    padding-inline-end: 36px;
  }
  @supports (appearance: base-select) {
    select,
    select::picker(select) {
      appearance: base-select;
    }
    select {
      align-items: center;
    }
    select::picker-icon {
      display: none;
    }
    select::picker(select) {
      margin-block: 4px;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 4px;
      background: var(--surface);
      color: var(--ink);
      box-shadow: 0 6px 24px #0002;
    }
    option {
      padding: 10px 12px;
      border-radius: 6px;
    }
    option:hover,
    option:focus-visible,
    option:checked {
      background: var(--soft);
    }
  }
  .required {
    color: var(--error);
  }
  .select-icon {
    position: absolute;
    top: 38px;
    inset-inline-end: 14px;
    color: var(--muted);
    pointer-events: none;
    display: inline-flex;
  }
  .password-toggle {
    position: absolute;
    inset-inline-end: 3px;
    top: 26px;
    width: 44px;
    height: 44px;
    border: 0;
    background: none;
    color: var(--muted);
    display: grid;
    place-items: center;
  }
  .field-error {
    min-height: 1.5em;
    font-size: 12px;
    line-height: 1.5;
    color: var(--error);
  }
`;

interface Props {
  readonly name: string;
  readonly label: string;
  readonly placeholder?: string;
  readonly type?: "text" | "password" | "email" | "url" | "tel" | "decimal" | "textarea";
  readonly options?: readonly { value: string; label: string }[];
  readonly autoComplete?: string;
  readonly disabled?: boolean;
  readonly optional?: boolean;
}

export default function FormField({
  name,
  label,
  placeholder,
  type = "text",
  options,
  autoComplete,
  disabled,
  optional,
}: Props) {
  const [field, meta, helpers] = useField<string>(name);
  const [revealed, setRevealed] = useState(false);
  const { m } = useMessages();
  const id = useId();
  const error = meta.touched ? meta.error : undefined;
  const shared = {
    ...field,
    id,
    disabled,
    required: !optional,
    "aria-invalid": !!error,
    "aria-describedby": error ? id + "-error" : undefined,
  };
  const password = type === "password";
  const latin = type === "email" || type === "url" || type === "tel";
  return (
    <Group>
      <label htmlFor={id}>
        {label.replace(/ \*$/, "")}
        {label.endsWith(" *") && (
          <span className="required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {options ? (
        <>
          <select {...shared}>
            <option value="">{placeholder}</option>
            {options.map(({ value, label }) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          <span className="select-icon">
            <Icon name="down" size={17} />
          </span>
        </>
      ) : type === "textarea" ? (
        <textarea {...shared} placeholder={placeholder} />
      ) : (
        <input
          {...shared}
          className={password ? "password-input" : undefined}
          dir={latin ? "ltr" : undefined}
          type={type === "decimal" || (password && revealed) ? "text" : type}
          inputMode={type === "decimal" ? "decimal" : undefined}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => {
            if (type !== "decimal") {
              field.onChange(event);
              return;
            }
            const value = event.currentTarget.value;
            if (/^\d*\.?\d*$/.test(normalizePriceInput(value))) void helpers.setValue(value);
          }}
        />
      )}
      {password && (
        <button
          className="password-toggle"
          type="button"
          disabled={disabled}
          aria-label={revealed ? m.hidePassword : m.showPassword}
          aria-pressed={revealed}
          onClick={() => setRevealed(!revealed)}
        >
          <Icon name="eye" size={17} />
        </button>
      )}
      <span className="field-error" id={id + "-error"}>
        {error}
      </span>
    </Group>
  );
}
