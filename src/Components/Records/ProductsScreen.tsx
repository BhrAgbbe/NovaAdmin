import styled from "styled-components";
import { categoryLabel, useMessages } from "@/Dictionary/messages";
import { useAppSelector } from "@/Redux/store";
import { ROUTES } from "@/Routes/routes";
import { Thumbnail } from "@/Shared/controls";
import { formatPrice, normalizeSearch } from "@/Utils/format";
import { getProducts } from "@/Utils/services/productApi";
import type { Product } from "@/types/product";
import RecordList from "./RecordList";

const Category = styled.span`
  display: inline-block;
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 3px 12px;
  color: var(--muted);
  font-size: 13px;
`;

export default function ProductsScreen() {
  const { locale, m } = useMessages();
  const additions = useAppSelector((state) => state.records.products);
  return (
    <RecordList<Product>
      title={m.products}
      description={m.productsHelp}
      eyebrow="01  /  CATALOG"
      add={m.addProduct}
      createPath={ROUTES.createProduct}
      search={m.searchProducts}
      empty={m.noProducts}
      error={m.productsLoadError}
      icon="box"
      createdMessage={m.productCreated}
      additions={additions}
      request={getProducts}
      matches={(product, term) => normalizeSearch(product.title).includes(term)}
      columns={[
        {
          label: m.image,
          width: "112px",
          render: (item) => <Thumbnail key={item.image} src={item.image} alt="" />,
        },
        {
          label: m.title,
          width: "37%",
          render: (item) => (
            <strong>
              <bdi>{item.title}</bdi>
            </strong>
          ),
        },
        {
          label: m.category,
          width: "21%",
          render: (item) => <Category>{categoryLabel(item.category, m)}</Category>,
        },
        {
          label: m.price,
          width: "auto",
          render: (item) => <strong>{formatPrice(item.price, locale)}</strong>,
        },
      ]}
    />
  );
}
