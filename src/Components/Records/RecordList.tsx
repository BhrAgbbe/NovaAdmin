import RecordFormModal from "@/Modals/RecordFormModal";
import Pagination from "@/Shared/Pagination";
import { Skeleton } from "@/Shared/Skeleton";
import { useSettledValue } from "@/Utils/useSettledValue";
import { getCategories } from "@/Utils/services/productApi";
import { requestMessage } from "@/Dictionary/requestMessage";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Heading, Panel } from "./RecordListStyles";
import RecordDetails from "./RecordDetails";
import RecordTable from "./RecordTable";
import RecordFilters from "./RecordFilters";
import { useMessages } from "@/Dictionary/messages";
import { Banner, Button, ButtonLink, EmptyState } from "@/Shared/controls";
import Icon from "@/Shared/Icon";
import { formatNumber, normalizeSearch,normalizePriceInput } from "@/Utils/format";
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
        <RecordFilters search={search} resource={resource} filters={filters} updateFilters={updateFilters} hasFilters={hasFilters} clearFilters={clearFilters} categories={categories} />
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
        <RecordTable title={title} icon={icon} columns={columns} initial={initial} visible={visible} setSelected={setSelected} />
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

