import styled from "styled-components";
import { Button, IconButton } from "./controls";
import Icon from "./Icon";
import Select from "./Select";

const Pages = styled.nav`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  .page-size {
    grid-column: 1;
    grid-row: 1;
    align-self: center;
    justify-self: start;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 44px;
    min-height: 44px;
    margin: 0;
    line-height: 1.2;
    font-size: 13px;
    font-weight: 600;
    color: var(--ink);
  }
  .page-size .select-control {
    width: auto;
    min-width: 86px;
    height: 44px;
  }
  .page-buttons {
    grid-column: 2;
    grid-row: 1;
    align-self: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
  }
  button {
    min-width: 44px;
    padding-inline: 8px;
  }
  [dir="ltr"] & .previous .nova-icon,
  [dir="rtl"] & .next .nova-icon {
    transform: scaleX(-1);
  }
  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    .page-size {
      grid-column: 1;
      grid-row: 1;
    }
    .page-buttons {
      grid-column: 1;
      grid-row: 2;
      justify-content: flex-start;
    }
  }
`;

interface Props {
  readonly page: number;
  readonly pages: number;
  readonly label: string;
  readonly previous: string;
  readonly next: string;
  readonly format: (page: number) => string;
  readonly pageLabel: (page: number) => string;
  readonly onChange: (page: number) => void;
  readonly size?: {
    readonly value: number;
    readonly options: readonly number[];
    readonly label: string;
    readonly onChange: (value: number) => void;
  };
}
export default function Pagination({
  page,
  pages,
  label,
  previous,
  next,
  format,
  pageLabel,
  onChange,
  size,
}: Props) {
  return (
    <Pages aria-label={label}>
      {size && (
        <label className="page-size">
          {size.label}
          <Select
            value={size.value}
            onChange={(event) => size.onChange(Number(event.currentTarget.value))}
          >
            {size.options.map((value) => (
              <option key={value} value={value}>
                {format(value)}
              </option>
            ))}
          </Select>
        </label>
      )}
      <div className="page-buttons">
        <IconButton
          type="button"
          className="previous"
          aria-label={previous}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <Icon name="chevron" size={17} />
        </IconButton>
        {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
          <Button
            type="button"
            key={number}
            $kind={page === number ? "primary" : "secondary"}
            aria-current={page === number ? "page" : undefined}
            aria-label={pageLabel(number)}
            onClick={() => onChange(number)}
          >
            {format(number)}
          </Button>
        ))}
        <IconButton
          type="button"
          className="next"
          aria-label={next}
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          <Icon name="chevron" size={17} />
        </IconButton>
      </div>
    </Pages>
  );
}
