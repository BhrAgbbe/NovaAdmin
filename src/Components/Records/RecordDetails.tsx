import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMessages } from "@/Dictionary/messages";
import { EmptyState } from "@/Shared/controls";
import { Skeleton } from "@/Shared/Skeleton";
import { useQueryRetry } from "@/Utils/api/useQueryRetry";
import { adminKeys } from "@/Utils/api/query";
import { DetailGrid } from "./RecordListStyles";

interface Row<T> { readonly key: string; readonly item: T }
interface Column<T> { readonly label: string; readonly render: (item: T) => ReactNode }

export default function RecordDetails<T extends { readonly id: number }>({
  resource,
  row,
  confirmedLocally,
  request,
  columns,
  extraDetails,
}: {
  readonly resource: "products" | "users";
  readonly row: Row<T>;
  readonly confirmedLocally: boolean;
  readonly request: (id: number) => Promise<T>;
  readonly columns: readonly Column<T>[];
  readonly extraDetails?: (item: T) => ReactNode;
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
