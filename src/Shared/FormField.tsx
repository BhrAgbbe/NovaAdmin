import { useField } from "formik";
import { useId, useState } from "react";
import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import Icon from "./Icon";

const Group = styled.div`
  display: grid;
  gap: 6px;
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
    min-height: 48px;
    padding: 10px 12px;
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
    min-height: 100px;
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
  .select-icon {
    position: absolute;
    top: 44px;
    inset-inline-end: 14px;
    color: var(--muted);
    pointer-events: none;
    display: inline-flex;
  }
  .password-toggle {
    position: absolute;
    inset-inline-end: 3px;
    top: 30px;
    width: 44px;
    height: 44px;
    border: 0;
    background: none;
    color: var(--muted);
    display: grid;
    place-items: center;
  }
  .field-error {
    font-size: 12px;
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
}

export default function FormField({
  name,
  label,
  placeholder,
  type = "text",
  options,
  autoComplete,
  disabled,
}: Props) {
  const [field, meta] = useField<string>(name);
  const [revealed, setRevealed] = useState(false);
  const { m } = useMessages();
  const id = useId();
  const error = meta.touched ? meta.error : undefined;
  const shared = {
    ...field,
    id,
    disabled,
    required: true,
    "aria-invalid": !!error,
    "aria-describedby": error ? id + "-error" : undefined,
  };
  const password = type === "password";
  const latin = type === "email" || type === "url" || type === "tel";
  return (
    <Group>
      <label htmlFor={id}>{label}</label>
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
      {error && (
        <span className="field-error" id={id + "-error"}>
          {error}
        </span>
      )}
    </Group>
  );
}
