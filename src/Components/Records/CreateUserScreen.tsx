import { useToast } from "@/Shared/Toast";
import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import { applyRecordChange, saveRecord } from "@/Utils/recordChanges";
import type { User } from "@/types/user";
import { ROUTES } from "@/Routes/routes";
import FormField from "@/Shared/FormField";
import { normalizeDigits } from "@/Utils/format";
import { saveUser } from "@/Utils/services/userApi";
import { createUserSchema } from "@/Validations/forms.schema";
import CreateRecord from "./CreateRecord";

const INITIAL = { firstName: "", lastName: "", username: "", email: "", password: "", phone: "" };
const Fields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 14px;
  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

interface Props {
  readonly edit?: { readonly key: string; readonly item: User };
  readonly onComplete?: () => void;
}

export default function CreateUserScreen({ edit, onComplete }: Props) {
  const { m } = useMessages();
  const toast = useToast();
  return (
    <CreateRecord
      initial={
        edit
          ? {
              ...INITIAL,
              firstName: edit.item.firstName,
              lastName: edit.item.lastName,
              username: edit.item.username,
              email: edit.item.email,
              phone: edit.item.phone,
            }
          : INITIAL
      }
      schema={createUserSchema(m, !!edit)}
      onComplete={onComplete}
      success={edit ? m.updated : m.userCreated}
      listLabel={m.users}
      listPath={ROUTES.users}
      title={m.addUser}
      save={edit ? m.edit : m.saveUser}
      onSave={async (values) => {
        const profile = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          username: values.username.trim(),
          email: values.email.trim(),
          phone: normalizeDigits(values.phone.trim()),
        };
        const change = await saveRecord(
          edit,
          (id) => ({ ...profile, id }),
          (id) => saveUser({ ...profile, password: values.password }, id)
        );
        if (!applyRecordChange("users", change)) toast(m.storageFull, "warning");
        return change.item.firstName + " " + change.item.lastName;
      }}
    >
      {({ isSubmitting }) => (
        <Fields>
          <FormField
            name="firstName"
            label={m.firstName + " *"}
            placeholder={m.firstPlaceholder}
            autoComplete="given-name"
            disabled={isSubmitting}
          />
          <FormField
            name="lastName"
            label={m.lastName + " *"}
            placeholder={m.lastPlaceholder}
            autoComplete="family-name"
            disabled={isSubmitting}
          />
          <FormField
            name="username"
            label={m.username + " *"}
            placeholder={m.userPlaceholder}
            autoComplete="username"
            disabled={isSubmitting}
          />
          <FormField
            name="email"
            label={m.email + " *"}
            placeholder="name@example.com"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
          />
          <FormField
            name="password"
            label={edit ? m.password : m.password + " *"}
            optional={!!edit}
            placeholder={edit ? m.optionalPassword : m.passwordPlaceholder}
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
          />
          <FormField
            name="phone"
            label={m.phone + " *"}
            placeholder={m.phonePlaceholder}
            type="tel"
            autoComplete="tel"
            disabled={isSubmitting}
          />
        </Fields>
      )}
    </CreateRecord>
  );
}
