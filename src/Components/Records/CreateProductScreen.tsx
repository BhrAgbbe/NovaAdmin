import { Skeleton } from "@/Shared/Skeleton";
import { useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { useToast } from "@/Shared/Toast";
import { useQueryRetry } from "@/Utils/api/useQueryRetry";
import { adminKeys } from "@/Utils/api/query";
import { applyRecordChange, saveRecord } from "@/Utils/recordChanges";
import type { Product } from "@/types/product";
import styled from "styled-components";
import { categoryLabel, useMessages } from "@/Dictionary/messages";
import { ROUTES } from "@/Routes/routes";
import { Banner, Button } from "@/Shared/controls";
import FormField from "@/Shared/FormField";
import Icon from "@/Shared/Icon";
import { isImageUrl, isLocalImage } from "@/Utils/format";
import { getCategories, saveProduct } from "@/Utils/services/productApi";
import { createProductSchema, parsePrice } from "@/Validations/forms.schema";
import CreateRecord from "./CreateRecord";

const INITIAL = { title: "", description: "", price: "", category: "", image: "" };

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 238px;
  gap: 20px;
  align-items: start;
  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 1fr);
  }
  @media (max-width: 460px) {
    .split {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  input[type="file"] {
    width: 100%;
    font-size: 12px;
  }
  .file-error {
    min-height: 2.5em;
    color: var(--error);
    font-size: 12px;
  }
  .fields {
    display: grid;
    gap: 10px;
  }
  .split {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  aside {
    padding: 12px;
    display: grid;
    text-align: center;
    gap: 8px;
    background: var(--soft);
    border-radius: 12px;
  }
  .preview {
    height: 126px;
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
    height: 126px;
    object-fit: contain;
  }
  aside strong {
    font-size: 15px;
  }
  aside p {
    color: var(--muted);
    font-size: 12px;
  }
`;

interface Props {
  readonly edit?: { readonly key: string; readonly item: Product };
  readonly onComplete?: () => void;
}

export default function CreateProductScreen({ edit, onComplete }: Props) {
  const { m } = useMessages();
  const toast = useToast();
  const fileHelpId = useId();
  const [fileError, setFileError] = useState(false);
  const [reading, setReading] = useState(false);
  const retry = useQueryRetry();
  const result = useQuery({ queryKey: adminKeys.categories, queryFn: getCategories });
  const options = result.isFetching || result.isError ? [] : (result.data ?? []);
  const available =
    edit && options.length && !options.includes(edit.item.category)
      ? [...options, edit.item.category]
      : options;
  const choices = available.map((value) => ({ value, label: categoryLabel(value, m, true) }));
  return (
    <>
      {result.isFetching && (
        <Skeleton role="status" aria-label={m.loading} style={{ height: 44 }} />
      )}
      {!result.isFetching && !choices.length && (
        <>
          <Banner
            title={result.isError ? m.productsLoadError : m.emptyCategories}
            detail={m.requestHelp}
          />
          <div>
            <Button
              $kind="secondary"
              onClick={() => void retry(result.refetch, m.productsLoadError)}
            >
              {m.tryAgain}
            </Button>
          </div>
        </>
      )}
      <CreateRecord
        initial={
          edit
            ? {
                title: edit.item.title,
                description: edit.item.description,
                price: String(edit.item.price),
                category: edit.item.category,
                image: edit.item.image,
              }
            : INITIAL
        }
        onComplete={onComplete}
        success={edit ? m.updated : m.productCreated}
        schema={createProductSchema(m)}
        listLabel={m.products}
        listPath={ROUTES.products}
        title={m.addProduct}
        save={edit ? m.edit : m.saveProduct}
        disabled={reading || !choices.length}
        onSave={async (values) => {
          const input = {
            title: values.title.trim(),
            description: values.description.trim(),
            price: parsePrice(values.price),
            category: values.category,
            image: values.image.trim(),
          };
          const change = await saveRecord(
            edit,
            (id) => ({ ...input, id }),
            (id) => saveProduct(input, id)
          );
          if (!applyRecordChange("products", change)) toast(m.storageFull, "warning");
          return change.item.title;
        }}
      >
        {({ values, isSubmitting, setFieldValue }) => (
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
                  placeholder={result.isFetching ? m.loading : m.chooseCategory}
                  options={choices}
                  disabled={isSubmitting || !choices.length}
                />
              </div>
              {isLocalImage(values.image) ? (
                <Button
                  type="button"
                  $kind="secondary"
                  disabled={isSubmitting}
                  onClick={() => void setFieldValue("image", "")}
                >
                  {m.clearImage}
                </Button>
              ) : (
                <FormField
                  name="image"
                  label={m.imageUrl + " *"}
                  placeholder="https://"
                  type="url"
                  disabled={isSubmitting || reading}
                />
              )}
              <label>
                {m.fileUpload}
                <input
                  type="file"
                  aria-describedby={fileHelpId}
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isSubmitting || reading}
                  onChange={(event) => {
                    const input = event.currentTarget;
                    const file = input.files?.[0];
                    input.value = "";
                    if (!file) return;
                    setFileError(false);
                    function rejectFile() {
                      setFileError(true);
                      toast(m.invalidFile, "error");
                    }
                    if (
                      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
                      file.size > 2 * 1024 * 1024
                    ) {
                      rejectFile();
                      return;
                    }
                    setReading(true);
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      try {
                        const source = reader.result;
                        if (typeof source !== "string" || !isLocalImage(source))
                          throw new Error("Invalid image");
                        const image = new Image();
                        image.src = source;
                        await image.decode();
                        await setFieldValue("image", source);
                      } catch {
                        rejectFile();
                      } finally {
                        setReading(false);
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              <small id={fileHelpId}>{m.localImageHelp}</small>
              <p className="file-error" role="status">
                {reading ? m.readingImage : fileError && m.invalidFile}
              </p>
            </div>
            <aside>
              <div className="preview">
                <Icon name="image" size={28} />
                {(isImageUrl(values.image.trim()) || isLocalImage(values.image)) && (
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
