import { categoryLabel, useMessages } from "@/Dictionary/messages";
import { FilterBar, FilterField, FilterInput, SearchField } from "@/Shared/FilterBar";
import { Button } from "@/Shared/controls";
import Select from "@/Shared/Select";
import { Skeleton } from "@/Shared/Skeleton";

type Filters = { text: string; category: string; min: string; max: string };
export default function RecordFilters({ search, resource, filters, updateFilters, hasFilters, clearFilters, categories }: {
  readonly search: string;
  readonly resource: "products" | "users";
  readonly filters: Filters;
  readonly updateFilters: (next: Partial<Filters>) => void;
  readonly hasFilters: boolean;
  readonly clearFilters: () => void;
  readonly categories: { readonly isFetching: boolean; readonly data?: readonly string[] };
}) {
  const { m } = useMessages();
  return (
        <FilterBar role="search" aria-label={search}>
          <SearchField
            label={search}
            placeholder={search}
            value={filters.text}
            onChange={(value) => updateFilters({ text: value })}
          />
          {resource === "products" && (
            <>
              <FilterField>
                {m.category}
                {categories.isFetching ? (
                  <Skeleton aria-hidden="true" style={{ height: 44, borderRadius: 10 }} />
                ) : (
                  <Select
                    aria-label={m.category}
                    value={filters.category}
                    onChange={(event) => updateFilters({ category: event.currentTarget.value })}
                  >
                    <option value="">{m.allCategories}</option>
                    {categories.data?.map((value) => (
                      <option key={value} value={value}>
                        {categoryLabel(value, m, true)}
                      </option>
                    ))}
                  </Select>
                )}
              </FilterField>
              <FilterField>
                {m.minPrice}
                <FilterInput
                  inputMode="decimal"
                  aria-label={m.minPrice}
                  value={filters.min}
                  onChange={(event) => updateFilters({ min: event.currentTarget.value })}
                />
              </FilterField>
              <FilterField>
                {m.maxPrice}
                <FilterInput
                  inputMode="decimal"
                  aria-label={m.maxPrice}
                  value={filters.max}
                  onChange={(event) => updateFilters({ max: event.currentTarget.value })}
                />
              </FilterField>
            </>
          )}
          {hasFilters && (
            <Button
              type="button"
              $kind="secondary"
              className="filter-actions"
              onClick={clearFilters}
            >
              {m.clearFilters}
            </Button>
          )}
        </FilterBar>
  );
}
