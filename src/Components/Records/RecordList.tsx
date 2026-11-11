import RecordFormModal from "@/Modals/RecordFormModal";
import Pagination from "@/Shared/Pagination";
import { Skeleton } from "@/Shared/Skeleton";
import Select from "@/Shared/Select";
import { FilterBar, FilterField, FilterInput, SearchField } from "@/Shared/FilterBar";
import { ActionGroup, ActionsCell } from "@/Shared/ActionGroup";
import { useSettledValue } from "@/Utils/useSettledValue";
import { categoryLabel } from "@/Dictionary/messages";
import { getCategories } from "@/Utils/services/productApi";
import { normalizePriceInput } from "@/Utils/format";
import { requestMessage } from "@/Dictionary/requestMessage";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import { Banner, Button, ButtonLink, EmptyState, IconButton } from "@/Shared/controls";
import Icon from "@/Shared/Icon";
import { formatNumber, normalizeSearch } from "@/Utils/format";
import { useMutation, useQuery } from "@tanstack/react-query";
import Confirm from "@/Modals/Confirm";
import Modal from "@/Modals/Modal";
import { useToast } from "@/Shared/Toast";
import { mergeRecords, type RecordChange } from "@/Storage/records";
import { getSession } from "@/Storage/session";
import { useQueryRetry } from "@/Utils/api/useQueryRetry";
import { adminKeys } from "@/Utils/api/query";

interface Column<T> {
  readonly label: string;
  readonly render: (item: T) => ReactNode;
}

interface Row<T> {
  readonly key: string;
  readonly item: T;
}

interface Props<T> {
  readonly title: string;
  readonly description: string;
  readonly add: string;
  readonly createPath: string;
  readonly search: string;
  readonly empty: string;
  readonly error: string;
  readonly icon: "box" | "users";
  readonly changes: readonly RecordChange<T>[];
  readonly resource: "products" | "users";
  readonly request: (category: string) => Promise<T[]>;
  readonly recordName: (item: T) => string;
  readonly priceOf?: (item: T) => number;
  readonly categoryOf?: (item: T) => string;
  readonly requestDetail: (id: number) => Promise<T>;
  readonly onDelete: (row: Row<T>) => Promise<boolean>;
  readonly editForm: (row: Row<T>, close: () => void) => ReactNode;
  readonly extraDetails?: (item: T) => ReactNode;
  readonly matches: (item: T, query: string) => boolean;
  readonly columns: readonly Column<T>[];
}

const Heading = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  h1 {
    font-size: 36px;
    margin: 6px 0;
  }
  p {
    font-size: 15px;
    color: var(--muted);
  }
  @media (max-width: 560px) {
    align-items: flex-start;
    flex-direction: column;
    h1 {
      font-size: 28px;
    }
  }
  a {
    min-width: 160px;
    min-height: 48px;
  }
`;
const Panel = styled.section`
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
  overflow: hidden;
  .state {
    padding: 18px;
  }
`;
const Table = styled.table<{ $tall: boolean }>`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  th,
  td {
    text-align: start;
    padding: 0 18px;
    overflow-wrap: anywhere;
  }
  th {
    height: 46px;
    background: var(--soft);
    font-size: 13px;
  }
  td {
    height: ${({ $tall }) => ($tall ? 72 : 60)}px;
    font-size: 14px;
    border-block-end: 1px solid var(--line);
  }
  tr:last-child td {
    border: 0;
  }
  .mobile-label {
    display: none;
  }
  .actions .destructive {
    color: var(--error);
  }
  .actions button {
    min-width: 44px;
    min-height: 44px;
  }
  @media (max-width: 1100px) {
    display: block;
    colgroup,
    thead {
      display: none;
    }
    tbody {
      display: grid;
      gap: 12px;
      padding: 12px;
    }
    tr {
      display: block;
      padding: 8px 12px;
      border: 1px solid var(--line);
      border-radius: 10px;
    }
    td,
    tr:last-child td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      height: auto;
      min-height: 42px;
      padding: 6px 0;
      border: 0;
    }
    .mobile-label {
      display: inline;
      color: var(--muted);
      flex: none;
      font-size: 12px;
    }
  }
`;
const DetailGrid = styled.dl`
  margin: 0;
  display: grid;
  gap: 0;
  & > div {
    display: grid;
    grid-template-columns: minmax(90px, 32%) minmax(0, 1fr);
    gap: 12px;
    padding: 12px 0;
    border-block-end: 1px solid var(--line);
  }
  & > div:last-child {
    border: 0;
  }
  dt {
    font-weight: 650;
    color: var(--muted);
  }
  dd {
    margin: 0;
    overflow-wrap: anywhere;
    min-width: 0;
  }
  dd img {
    width: min(100%, 180px);
    height: 125px;
    object-fit: contain;
  }
`;
type Selected<T> = { mode: "details" | "edit" | "delete"; row: Row<T> };
const PAGE_SIZES = [5, 10, 15, 25] as const;

export default function RecordList<T extends { readonly id: number }>({
  title,
  description,
  add,
  createPath,
  search,
  empty,
  error,
  icon,
  resource,
  changes,
  request,
  requestDetail,
  recordName,
  priceOf,
  categoryOf,
  matches,
  columns,
  onDelete,
  editForm,
  extraDetails,
}: Props<T>) {
  const { locale, m } = useMessages();
  const navigate = useNavigate();
  const toast = useToast();
  const [filters, setFilters] = useState({ text: "", category: "", min: "", max: "" });
  const [size, setSize] = useState(10);
  const settled = useSettledValue(filters);
  const categories = useQuery({
    queryKey: adminKeys.categories,
    queryFn: getCategories,
    enabled: resource === "products",
  });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Selected<T> | null>(null);
  const retry = useQueryRetry();
  const min = settled.min === "" ? 0 : Number(normalizePriceInput(settled.min));
  const max = settled.max === "" ? Infinity : Number(normalizePriceInput(settled.max));
  const invalidRange =
    !Number.isFinite(min) || (settled.max !== "" && !Number.isFinite(max)) || min < 0 || min > max;
  const result = useQuery({
    queryKey: [...adminKeys[resource], "list", settled, size],
    queryFn: () => request(settled.category),
    enabled: !invalidRange,
  });
  const deletion = useMutation({ mutationFn: onDelete });
  const term = normalizeSearch(settled.text);
  const hasFilters = Object.values(filters).some(Boolean);
  const initial = !invalidRange && (filters !== settled || result.isFetching || result.isPending);
  const failed = result.isError && !initial;
  const rows =
    initial || failed || invalidRange
      ? []
      : mergeRecords(result.data ?? [], changes, !!settled.category).filter(
          ({ item }) =>
            matches(item, term) &&
            (!settled.category || categoryOf?.(item) === settled.category) &&
            (!priceOf || (priceOf(item) >= min && priceOf(item) <= max))
        );
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const currentPage = Math.min(page, pages);
  const visible = rows.slice((currentPage - 1) * size, currentPage * size);

  function updateFilters(next: Partial<typeof filters>) {
    setFilters({ ...filters, ...next });
    setPage(1);
  }
  function clearFilters() {
    updateFilters({ text: "", category: "", min: "", max: "" });
  }

  async function confirmDelete(row: Row<T>) {
    const session = getSession();
    try {
      const persisted = await deletion.mutateAsync(row);
      if (getSession() !== session) return;
      if (visible.length === 1) setPage(Math.max(1, currentPage - 1));
      setSelected(null);
      toast(m.deleted, "success");
      if (!persisted) toast(m.storageFull, "warning");
    } catch (error) {
      if (getSession() === session) toast(requestMessage(error, m, m.deleteFailed), "error");
    } finally {
      deletion.reset();
    }
  }

  return (
    <>
      <Heading>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {
          <ButtonLink to={createPath} state={{ dialog: true }}>
            <Icon name="plus" size={17} />
            {add}
          </ButtonLink>
        }
      </Heading>
      {failed && <Banner title={error} detail={requestMessage(result.error, m, m.requestHelp)} />}
      <Panel aria-busy={initial}>
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
        {invalidRange && (
          <div className="state">
            <Banner title={m.invalidRange} />
          </div>
        )}
        {categories.isError && resource === "products" && (
          <div className="state">
            <Banner title={m.productsLoadError} />
            <Button
              type="button"
              $kind="secondary"
              onClick={() => void retry(categories.refetch, m.productsLoadError)}
            >
              {m.tryAgain}
            </Button>
          </div>
        )}
        <Table $tall={icon === "box"} aria-label={title}>
          <colgroup>
            {columns.map((column) => (
              <col key={column.label} />
            ))}
            <col style={{ width: "204px" }} />
          </colgroup>
          <thead>
            <tr>
              {columns.map((column) => (
                <th scope="col" key={column.label}>
                  {column.label}
                </th>
              ))}
              <th scope="col">{m.actions}</th>
            </tr>
          </thead>
          <tbody>
            {initial
              ? Array.from({ length: 5 }, (_, index) => (
                  <tr key={index} aria-hidden="true">
                    {columns.map((column) => (
                      <td key={column.label}>
                        <Skeleton />
                      </td>
                    ))}
                    <td>
                      <Skeleton />
                    </td>
                  </tr>
                ))
              : visible.map((row) => (
                  <tr key={row.key}>
                    {columns.map((column) => (
                      <td key={column.label}>
                        <span className="mobile-label" aria-hidden="true">
                          {column.label}
                        </span>
                        {column.render(row.item)}
                      </td>
                    ))}
                    <ActionsCell>
                      <ActionGroup className="actions">
                        <IconButton
                          type="button"
                          aria-label={m.details}
                          title={m.details}
                          onClick={() => setSelected({ mode: "details", row })}
                        >
                          <Icon name="eye" size={18} />
                        </IconButton>
                        <IconButton
                          type="button"
                          aria-label={m.edit}
                          title={m.edit}
                          onClick={() => setSelected({ mode: "edit", row })}
                        >
                          <Icon name="pencil" size={18} />
                        </IconButton>
                        <IconButton
                          type="button"
                          aria-label={m.remove}
                          title={m.remove}
                          className="destructive"
                          onClick={() => setSelected({ mode: "delete", row })}
                        >
                          <Icon name="trash" size={18} />
                        </IconButton>
                      </ActionGroup>
                    </ActionsCell>
                  </tr>
                ))}
          </tbody>
        </Table>
        {initial ? (
          <Skeleton aria-hidden="true" style={{ width: 160, height: 44, margin: "12px auto" }} />
        ) : (
          !failed &&
          !invalidRange &&
          rows.length > 0 && (
            <Pagination
              page={currentPage}
              pages={pages}
              label={title}
              previous={m.previous}
              next={m.next}
              format={(value) => formatNumber(value, locale)}
              pageLabel={(value) => m.pageLabel + " " + formatNumber(value, locale)}
              onChange={setPage}
              size={{
                value: size,
                options: PAGE_SIZES,
                label: m.pageSize,
                onChange: (value) => {
                  setSize(value);
                  setPage(1);
                },
              }}
            />
          )
        )}
        {!initial && !invalidRange && rows.length === 0 && (
          <div className="state">
            {failed ? (
              <EmptyState
                icon="refresh"
                title={m.unableToLoad}
                detail={m.tryLoading}
                action={m.tryAgain}
                onAction={() => void retry(result.refetch, error)}
              />
            ) : hasFilters ? (
              <EmptyState
                icon="search"
                title={m.noMatches}
                detail={m.noMatchesHelp}
                action={m.clearSearch}
                onAction={clearFilters}
              />
            ) : (
              <EmptyState
                icon={icon}
                title={empty}
                detail={m.emptyHelp}
                action={add}
                onAction={() => navigate(createPath)}
              />
            )}
          </div>
        )}
      </Panel>
      {selected?.mode === "details" && (
        <Modal title={m.details} closeLabel={m.close} onClose={() => setSelected(null)}>
          <RecordDetails
            resource={resource}
            row={selected.row}
            confirmedLocally={changes.some(({ key }) => key === selected.row.key)}
            request={requestDetail}
            columns={columns}
            extraDetails={extraDetails}
          />
        </Modal>
      )}
      {selected?.mode === "edit" && (
        <RecordFormModal title={m.edit} onClose={() => setSelected(null)}>
          {editForm(selected.row, () => setSelected(null))}
        </RecordFormModal>
      )}
      {selected?.mode === "delete" && (
        <Confirm
          title={resource === "products" ? m.deleteProduct : m.deleteUser}
          detail={(resource === "products" ? m.confirmProductDelete : m.confirmUserDelete).replace(
            "{name}",
            recordName(selected.row.item)
          )}
          destructive
          action={deletion.isPending ? m.deleting : m.remove}
          busy={deletion.isPending}
          onClose={() => setSelected(null)}
          onConfirm={() => void confirmDelete(selected.row)}
        />
      )}
    </>
  );
}

function RecordDetails<T extends { readonly id: number }>({
  resource,
  row,
  confirmedLocally,
  request,
  columns,
  extraDetails,
}: {
  readonly resource: Props<T>["resource"];
  readonly row: Row<T>;
  readonly confirmedLocally: boolean;
  readonly request: Props<T>["requestDetail"];
  readonly columns: Props<T>["columns"];
  readonly extraDetails: Props<T>["extraDetails"];
}) {
  const { m } = useMessages();
  const retry = useQueryRetry();
  const result = useQuery({
    queryKey: adminKeys.detail(resource, row.item.id),
    queryFn: () => request(row.item.id),
    enabled: !confirmedLocally,
  });
  const item = confirmedLocally ? row.item : result.data;
  if (!confirmedLocally && result.isFetching)
    return <Skeleton role="status" aria-label={m.loading} style={{ height: 160 }} />;
  if (!item)
    return (
      <EmptyState
        icon="refresh"
        title={m.unableToLoad}
        detail={m.tryLoading}
        action={m.tryAgain}
        onAction={() => void retry(result.refetch, m.unableToLoad)}
      />
    );
  return (
    <DetailGrid>
      {columns.map((column) => (
        <div key={column.label}>
          <dt>{column.label}</dt>
          <dd>{column.render(item)}</dd>
        </div>
      ))}
      {extraDetails?.(item)}
    </DetailGrid>
  );
}
