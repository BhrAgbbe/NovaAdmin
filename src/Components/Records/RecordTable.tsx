import type { ReactNode } from "react";
import { useMessages } from "@/Dictionary/messages";
import { ActionGroup, ActionsCell } from "@/Shared/ActionGroup";
import { IconButton } from "@/Shared/controls";
import Icon from "@/Shared/Icon";
import { Skeleton } from "@/Shared/Skeleton";
import { Table } from "./RecordListStyles";

type Row<T> = { readonly key: string; readonly item: T };
type Column<T> = { readonly label: string; readonly render: (item: T) => ReactNode };
type Selection<T> = { mode: "details" | "edit" | "delete"; row: Row<T> };

export default function RecordTable<T>({ title, icon, columns, initial, visible, setSelected }: {
  readonly title: string;
  readonly icon: "box" | "users";
  readonly columns: readonly Column<T>[];
  readonly initial: boolean;
  readonly visible: readonly Row<T>[];
  readonly setSelected: (selection: Selection<T>) => void;
}) {
  const { m } = useMessages();
  return (
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
  );
}
