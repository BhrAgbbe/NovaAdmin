import CreateProductScreen from "./CreateProductScreen";
import { Resource } from "@/types/Enums/Resource";
import { deleteRecord } from "@/Utils/services/deleteRecord";
import { applyRecordChange } from "@/Utils/recordChanges";
import { getSession } from "@/Storage/session";
import CategoryBadge from "@/Shared/CategoryBadge";
import { categoryLabel, useMessages } from "@/Dictionary/messages";
import { useAppSelector } from "@/Redux/store";
import { ROUTES } from "@/Routes/routes";
import { Thumbnail } from "@/Shared/controls";
import { formatPrice, normalizeSearch } from "@/Utils/format";
import { getProduct, getProducts } from "@/Utils/services/productApi";
import type { Product } from "@/types/product";
import RecordList from "./RecordList";

export default function ProductsScreen() {
  const { locale, m } = useMessages();
  const changes = useAppSelector((state) => state.records.products);
  return (
    <RecordList<Product>
      title={m.products}
      description={m.productsHelp}

      add={m.addProduct}
      createPath={ROUTES.createProduct}
      search={m.searchProducts}
      empty={m.noProducts}
      error={m.productsLoadError}
      icon="box"

      changes={changes}
      resource="products"
      onDelete={async (row) => {
        const session = getSession();
        if (!session) throw new Error("Session expired");
        if (row.key.startsWith("api:")) await deleteRecord(Resource.Products, row.item.id);
        if (getSession() !== session) throw new Error("Session changed");
        return applyRecordChange("products", { key: row.key, item: null });
      }}
      editForm={(row, close) => <CreateProductScreen edit={row} onComplete={close} />}
      request={getProducts}
      recordName={(item) => item.title}
      categoryOf={(item) => item.category}
      priceOf={(item) => item.price}
      requestDetail={getProduct}
      matches={(product, term) => normalizeSearch(product.title).includes(term)}
      extraDetails={(item) => (
        <div>
          <dt>{m.description}</dt>
          <dd>
            <bdi>{item.description}</bdi>
          </dd>
        </div>
      )}
      columns={[
        {
          label: m.image,

          render: (item) => <Thumbnail key={item.image} src={item.image} alt="" />,
        },
        {
          label: m.title,

          render: (item) => (
            <strong>
              <bdi>{item.title}</bdi>
            </strong>
          ),
        },
        {
          label: m.category,

          render: (item) => (
            <CategoryBadge category={item.category} label={categoryLabel(item.category, m)} />
          ),
        },
        {
          label: m.price,

          render: (item) => <strong>{formatPrice(item.price, locale)}</strong>,
        },
      ]}
    />
  );
}
