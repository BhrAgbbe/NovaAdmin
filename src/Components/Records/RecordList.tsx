import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import { Banner, Button, ButtonLink, EmptyState } from "@/Shared/controls";
import Icon from "@/Shared/Icon";
import { formatNumber, normalizeSearch } from "@/Utils/format";
import { useRequest } from "@/Utils/useRequest";

interface Column<T> {
  readonly label: string;
  readonly render: (item: T) => ReactNode;
  readonly width: string;
}

interface Props<T> {
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly add: string;
  readonly createPath: string;
  readonly search: string;
  readonly empty: string;
  readonly error: string;
  readonly icon: "box" | "users";
  readonly createdMessage: string;
  readonly additions: readonly { readonly key: string; readonly item: T }[];
  readonly request: (signal: AbortSignal) => Promise<T[]>;
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
  small {
    font:
      700 12px Inter,
      sans-serif;
    color: var(--brand-ink);
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
  .toolbar {
    padding: 14px 18px;
    min-height: 72px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
  }
  .search {
    width: 312px;
    display: flex;
    gap: 10px;
    align-items: center;
    border: 1px solid var(--line);
    background: var(--soft);
    color: var(--muted);
    border-radius: 10px;
    min-height: 44px;
    padding-inline: 12px;
  }
  .search:focus-within {
    border-color: var(--focus);
  }
  input {
    border: 0;
    background: none;
    outline: none;
    min-width: 0;
    flex: 1;
    color: var(--ink);
    font-size: 13px;
  }
  input::placeholder {
    color: var(--muted);
    opacity: 1;
  }
  .count {
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 13px;
    color: var(--muted);
  }
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
`;
const Skeleton = styled.span`
  display: block;
  width: 59%;
  height: 13px;
  border-radius: 4px;
  background: var(--soft);
`;

export default function RecordList<T extends { readonly id: number }>({
  title,
  description,
  eyebrow,
  add,
  createPath,
  search,
  empty,
  error,
  icon,
  createdMessage,
  additions,
  request,
  matches,
  columns,
}: Props<T>) {
  const { locale, m } = useMessages();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [query, setQuery] = useState("");
  const { result, retry } = useRequest(request);
  const term = normalizeSearch(query);
  const server =
    result.status === "success"
      ? result.data.map((item, index) => ({ key: "api:" + item.id + ":" + index, item }))
      : [];
  const records = [...additions, ...server];
  const rows = records.filter(({ item }) => matches(item, term));
  const initial = result.status === "loading";
  const failed = result.status === "error";
  const noRows = !initial && rows.length === 0;
  const created = typeof state?.created === "string" ? state.created : undefined;

  return (
    <>
      <Heading>
        <div>
          <small dir="ltr">{eyebrow}</small>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <ButtonLink to={createPath}>
          <Icon name="plus" size={17} />
          {add}
        </ButtonLink>
      </Heading>
      {created && (
        <Banner variant="success" title={createdMessage + " · " + created} detail={m.createdHelp} />
      )}
      {failed && <Banner title={error} detail={m.requestHelp} />}
      <Panel aria-busy={initial}>
        <div className="toolbar">
          <label className="search">
            <Icon name="search" size={18} />
            <span className="visually-hidden">{search}</span>
            <input
              type="search"
              placeholder={search}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </label>
          <div className="count">
            {query && (
              <Button type="button" $kind="quiet" onClick={() => setQuery("")}>
                <Icon name="x" size={17} />
                {m.clear}
              </Button>
            )}
            <span role="status">
              {initial ? m.loading : formatNumber(rows.length, locale) + " " + m.results}
            </span>
          </div>
        </div>
        <Table $tall={icon === "box"} aria-label={title}>
          <colgroup>
            {columns.map((column) => (
              <col key={column.label} style={{ width: column.width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {columns.map((column) => (
                <th scope="col" key={column.label}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initial
              ? Array.from({ length: 5 }, (_, i) => (
                  <tr key={i} aria-hidden="true">
                    {columns.map((column) => (
                      <td key={column.label}>
                        <Skeleton />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map(({ item, key }) => (
                  <tr key={key}>
                    {columns.map((column) => (
                      <td key={column.label}>{column.render(item)}</td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </Table>
        {noRows && (
          <div className="state">
            {failed ? (
              <EmptyState
                icon="refresh"
                title={m.unableToLoad}
                detail={m.tryLoading}
                action={m.tryAgain}
                onAction={retry}
              />
            ) : term ? (
              <EmptyState
                icon="search"
                title={m.noMatches}
                detail={m.noMatchesHelp}
                action={m.clearSearch}
                onAction={() => setQuery("")}
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
        {failed && !noRows && (
          <div className="state">
            <Button $kind="secondary" onClick={retry}>
              {m.tryAgain}
            </Button>
          </div>
        )}
      </Panel>
    </>
  );
}
