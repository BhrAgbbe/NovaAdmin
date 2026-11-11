import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import { useAppSelector } from "@/Redux/store";
import { ROUTES } from "@/Routes/routes";
import { Banner, Button, ButtonLink } from "@/Shared/controls";
import Icon from "@/Shared/Icon";
import { Skeleton } from "@/Shared/Skeleton";
import { mergeRecords } from "@/Storage/records";
import { adminKeys } from "@/Utils/api/query";
import { formatNumber } from "@/Utils/format";
import { getProducts } from "@/Utils/services/productApi";
import { getUsers } from "@/Utils/services/userApi";

const Overview = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 16px;
  article {
    display: grid;
    gap: 12px;
    justify-items: start;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid var(--line);
    background: var(--surface);
  }
  strong {
    font-size: 32px;
    line-height: 1.2;
  }
`;

export default function DashboardPage() {
  const { m, locale } = useMessages();
  const changes = useAppSelector((state) => state.records);
  const products = useQuery({ queryKey: adminKeys.products, queryFn: () => getProducts() });
  const users = useQuery({ queryKey: adminKeys.users, queryFn: getUsers });
  const catalog = mergeRecords(products.data ?? [], changes.products);
  const cards = [
    {
      label: m.products,
      count: catalog.length,
      query: products,
      path: ROUTES.products,
      icon: "box",
    },
    {
      label: m.users,
      count: mergeRecords(users.data ?? [], changes.users).length,
      query: users,
      path: ROUTES.users,
      icon: "users",
    },
  ] as const;
  return (
    <Overview>
      {cards.map(({ label, count, query, path, icon }) => (
        <article key={path} aria-busy={query.isFetching}>
          <Icon name={icon} size={24} />
          <h2>{label}</h2>
          {query.isFetching ? (
            <Skeleton aria-hidden="true" style={{ width: 72, height: 38 }} />
          ) : query.isError ? (
            <>
              <Banner title={m.unableToLoad} />
              <Button type="button" $kind="secondary" onClick={() => void query.refetch()}>
                {m.tryAgain}
              </Button>
            </>
          ) : (
            <strong>{formatNumber(count, locale)}</strong>
          )}
          <ButtonLink $kind="secondary" to={path}>
            {label}
            <Icon name="arrow" directional size={16} />
          </ButtonLink>
        </article>
      ))}
    </Overview>
  );
}
