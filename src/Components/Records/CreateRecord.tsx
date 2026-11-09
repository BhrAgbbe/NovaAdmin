import { Form, Formik, type FormikProps, type FormikValues } from "formik";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { ObjectSchema } from "yup";
import { useMessages } from "@/Dictionary/messages";
import { Banner, Button, ButtonLink } from "@/Shared/controls";
import Icon from "@/Shared/Icon";
import { getSession } from "@/Storage/session";

const Heading = styled.header`
  display: grid;
  gap: 8px;
  h1 {
    font-size: 35px;
  }
  p {
    font-size: 15px;
    color: var(--muted);
  }
  a {
    font-size: 14px;
    color: var(--brand-ink);
  }
`;
const Card = styled(Form)`
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 15px;
  display: grid;
  gap: 18px;
  .controls {
    border-block-start: 1px solid var(--line);
    padding-block-start: 18px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  .controls a {
    min-width: 108px;
  }
  .controls button {
    min-width: 155px;
  }
`;

interface Props<T extends FormikValues> {
  readonly initial: T;
  readonly schema: ObjectSchema<T>;
  readonly listLabel: string;
  readonly listPath: string;
  readonly title: string;
  readonly save: string;
  readonly onSave: (values: T) => Promise<string>;
  readonly children: (form: FormikProps<T>) => ReactNode;
  readonly disabled?: boolean;
}

export default function CreateRecord<T extends FormikValues>({
  initial,
  schema,
  listLabel,
  listPath,
  title,
  save,
  onSave,
  children,
  disabled,
}: Props<T>) {
  const { m } = useMessages();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  return (
    <>
      <Heading>
        <div>
          <Link to={listPath}>{listLabel}</Link>
          <span aria-hidden="true"> / </span>
          <span>{title}</span>
        </div>
        <h1>{title}</h1>
        <p>{m.requiredForm}</p>
      </Heading>
      <Formik
        initialValues={initial}
        validationSchema={schema}
        onSubmit={async (values) => {
          const session = getSession();
          if (!session || disabled) return;
          setFailed(false);
          try {
            const created = await onSave(values);
            if (getSession() === session) navigate(listPath, { state: { created } });
          } catch {
            if (getSession() === session) setFailed(true);
          }
        }}
      >
        {(form) => (
          <>
            {form.submitCount > 0 && Object.keys(form.errors).length > 0 && (
              <Banner title={m.reviewForm} detail={m.reviewHelp} />
            )}
            {failed && <Banner title={m.saveError} detail={m.saveErrorHelp} />}
            <Card noValidate>
              {children(form)}
              <div className="controls">
                {form.isSubmitting ? (
                  <Button $kind="secondary" type="button" disabled>
                    {m.cancel}
                  </Button>
                ) : (
                  <ButtonLink $kind="secondary" to={listPath}>
                    {m.cancel}
                  </ButtonLink>
                )}
                <Button type="submit" disabled={form.isSubmitting || disabled}>
                  {!form.isSubmitting && <Icon name="check" size={17} />}
                  {form.isSubmitting ? m.saving : failed ? m.tryAgain : save}
                </Button>
              </div>
            </Card>
          </>
        )}
      </Formik>
    </>
  );
}
