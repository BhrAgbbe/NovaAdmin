import styled from "styled-components";
import Icon from "./Icon";

/**
 * One toolbar grid for every list filter. Controls share height, radius,
 * border and focus treatment so the filter row reads as a single control group.
 */
export const FilterBar = styled.div`
  display: grid;
  grid-template-columns: minmax(210px, 1.35fr) repeat(3, minmax(132px, 1fr)) auto;
  align-items: end;
  gap: 14px;
  padding: 20px 18px 18px;
  border-block-end: 1px solid var(--line);
  @media (max-width: 1180px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    .filter-search,
    .filter-actions {
      grid-column: 1 / -1;
    }
    .filter-actions {
      justify-self: start;
    }
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 16px 14px 14px;
  }
`;

export const FilterField = styled.label`
  display: grid;
  gap: 6px;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
`;

const controlStyles = `
  width: 100%;
  min-width: 0;
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  font-size: 14px;
  font-weight: 400;
`;

export const FilterInput = styled.input`
  ${controlStyles}
  &:focus-visible {
    border-color: var(--focus);
    outline: 2px solid var(--focus);
    outline-offset: 1px;
  }
`;

const SearchControl = styled.span`
  display: flex;
  align-items: center;
  gap: 9px;
  height: 44px;
  padding-inline: 12px;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--surface);
  color: var(--muted);
  &:focus-within {
    border-color: var(--focus);
    outline: 2px solid var(--focus);
    outline-offset: 1px;
  }
  input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0;
    border: 0;
    outline: 0;
    background: none;
    color: var(--ink);
    font: inherit;
    font-size: 14px;
  }
  input::placeholder {
    color: var(--muted);
    opacity: 1;
  }
`;

export function SearchField({
  label,
  value,
  placeholder,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly placeholder: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <FilterField className="filter-search">
      {label}
      <SearchControl>
        <Icon name="search" size={17} />
        <input
          type="search"
          aria-label={label}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </SearchControl>
    </FilterField>
  );
}
