import { Progress } from "@/Shared/Skeleton";
import { requestMessage } from "@/Dictionary/requestMessage";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/Shared/Toast";
import { Form, Formik, type FormikProps, type FormikValues } from "formik";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { ObjectSchema } from "yup";
import { useMessages } from "@/Dictionary/messages";
import FormValidationToast from "@/Shared/FormValidationToast";
import { Button, ButtonLink } from "@/Shared/controls";
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
const Card = styled(Form)<{ $embedded: boolean }>`
  padding: ${({ $embedded }) => ($embedded ? 0 : "18px")};
  background: ${({ $embedded }) => ($embedded ? "transparent" : "var(--surface)")};
  border: ${({ $embedded }) => ($embedded ? 0 : "1px solid var(--line)")};
  border-radius: ${({ $embedded }) => ($embedded ? 0 : "15px")};
  display: grid;
  gap: 10px;
  .controls {
    border-block-start: 1px solid var(--line);
    padding-block-start: 12px;
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
  @media (max-width: 520px) {
    padding: 14px;
    .controls {
      flex-wrap: wrap;
    }
    .controls button {
      min-width: 0;
    }
  }
`;

function submitLabel(
  submitting: boolean,
  failed: boolean,
  saving: string,
  retry: string,
  save: string
) {
  if (submitting) return saving;
  if (failed) return retry;
  return save;
}

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
  readonly onComplete?: () => void;
  readonly success?: string;
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
  onComplete,
  success,
}: Props<T>) {
  const { m } = useMessages();
  const navigate = useNavigate();
  const toast = useToast();
  const mutation = useMutation({ mutationFn: onSave });
  const [failed, setFailed] = useState(false);
  const embedded = Boolean(onComplete);
  return (
    <>
      {!onComplete && (
        <Heading>
          <div>
            <Link to={listPath}>{listLabel}</Link>
            <span aria-hidden="true"> / </span>
            <span>{title}</span>
          </div>
          <h1>{title}</h1>
          <p>{m.requiredForm}</p>
        </Heading>
      )}
      <Formik
        initialValues={initial}
        validationSchema={schema}
        onSubmit={async (values) => {
          const session = getSession();
          if (!session || disabled) return;
          setFailed(false);
          try {
            const name = await mutation.mutateAsync(values);
            if (getSession() !== session) return;
            toast((success ?? m.updated) + " · " + name, "success");
            if (onComplete) onComplete();
            else navigate(listPath);
          } catch (error) {
            if (getSession() === session) {
              toast(requestMessage(error, m, m.saveError), "error");
              setFailed(true);
            }
          } finally {
            mutation.reset();
          }
        }}
      >
        {(form) => {
          const cancel = onComplete ? (
            <Button $kind="secondary" type="button" onClick={onComplete}>
              {m.cancel}
            </Button>
          ) : (
            <ButtonLink $kind="secondary" to={listPath}>
              {m.cancel}
            </ButtonLink>
          );
          return (
            <>
              <FormValidationToast message={m.reviewForm} />
              <Card $embedded={embedded} noValidate aria-busy={form.isSubmitting}>
                {children(form)}
                <div className="controls">
                  {form.isSubmitting ? (
                    <Button $kind="secondary" type="button" disabled>
                      {m.cancel}
                    </Button>
                  ) : (
                    cancel
                  )}
                  <Button type="submit" disabled={form.isSubmitting || disabled}>
                    {form.isSubmitting ? (
                      <Progress aria-hidden="true" />
                    ) : (
                      <Icon name="check" size={17} />
                    )}
                    {submitLabel(form.isSubmitting, failed, m.saving, m.tryAgain, save)}
                  </Button>
                </div>
              </Card>
            </>
          );
        }}
      </Formik>
    </>
  );
}
