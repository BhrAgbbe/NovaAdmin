import styled from "styled-components";
import { categoryLabel, useMessages } from "@/Dictionary/messages";
import { productCreated, useAppDispatch } from "@/Redux/store";
import { ROUTES } from "@/Routes/routes";
import { Banner, Button } from "@/Shared/controls";
import FormField from "@/Shared/FormField";
import Icon from "@/Shared/Icon";
import { getSession } from "@/Storage/session";
import { isImageUrl } from "@/Utils/format";
import { getCategories, postProduct } from "@/Utils/services/productApi";
import { useRequest } from "@/Utils/useRequest";
import { createProductSchema, parsePrice } from "@/Validations/forms.schema";
import CreateRecord from "./CreateRecord";

const INITIAL = { title: "", description: "", price: "", category: "", image: "" };

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 238px;
  gap: 24px;
  align-items: start;
  .fields {
    display: grid;
    gap: 12px;
  }
  .split {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  aside {
    padding: 14px;
    display: grid;
    text-align: center;
    gap: 10px;
    background: var(--soft);
    border-radius: 12px;
  }
  .preview {
    height: 138px;
    display: grid;
    place-items: center;
    background: var(--surface);
    color: var(--muted);
    border: 1px solid var(--line);
    border-radius: 8px;
    overflow: hidden;
  }
  img,
  .preview .nova-icon {
    grid-area: 1 / 1;
  }
  img {
    z-index: 1;
    width: 100%;
    height: 138px;
    object-fit: cover;
  }
  aside strong {
    font-size: 15px;
  }
  aside p {
    color: var(--muted);
    font-size: 12px;
  }
`;

export default function CreateProductScreen() {
  const { m } = useMessages();
  const dispatch = useAppDispatch();
  const { result, retry } = useRequest(getCategories);
  const choices =
    result.status === "success"
      ? result.data.map((value) => ({ value, label: categoryLabel(value, m, true) }))
      : [];
  return (
    <>
      {result.status === "error" && (
        <>
          <Banner title={m.productsLoadError} detail={m.requestHelp} />
          <div>
            <Button $kind="secondary" onClick={retry}>
              {m.tryAgain}
            </Button>
          </div>
        </>
      )}
      <CreateRecord
        initial={INITIAL}
        schema={createProductSchema(m)}
        listLabel={m.products}
        listPath={ROUTES.products}
        title={m.addProduct}
        save={m.saveProduct}
        disabled={!choices.length}
        onSave={async (values) => {
          const session = getSession();
          const item = await postProduct({
            title: values.title.trim(),
            description: values.description.trim(),
            price: parsePrice(values.price),
            category: values.category,
            image: values.image.trim(),
          });
          if (getSession() === session)
            dispatch(productCreated({ key: crypto.randomUUID(), item }));
          return item.title;
        }}
      >
        {({ values, isSubmitting }) => (
          <Grid>
            <div className="fields">
              <FormField
                name="title"
                label={m.title + " *"}
                placeholder={m.titlePlaceholder}
                disabled={isSubmitting}
              />
              <FormField
                name="description"
                label={m.description + " *"}
                placeholder={m.descriptionPlaceholder}
                type="textarea"
                disabled={isSubmitting}
              />
              <div className="split">
                <FormField
                  name="price"
                  label={m.priceToman + " *"}
                  placeholder={m.pricePlaceholder}
                  type="decimal"
                  disabled={isSubmitting}
                />
                <FormField
                  name="category"
                  label={m.category + " *"}
                  placeholder={result.status === "loading" ? m.loading : m.chooseCategory}
                  options={choices}
                  disabled={isSubmitting || !choices.length}
                />
              </div>
              <FormField
                name="image"
                label={m.imageUrl + " *"}
                placeholder="https://"
                type="url"
                disabled={isSubmitting}
              />
            </div>
            <aside>
              <div className="preview">
                <Icon name="image" size={28} />
                {isImageUrl(values.image.trim()) && (
                  <img
                    key={values.image}
                    src={values.image.trim()}
                    alt=""
                    referrerPolicy="no-referrer"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }}
                  />
                )}
              </div>
              <strong>{m.imagePreview}</strong>
              <p>{m.imagePreviewHelp}</p>
            </aside>
          </Grid>
        )}
      </CreateRecord>
    </>
  );
}
