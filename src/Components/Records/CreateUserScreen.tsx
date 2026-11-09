import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import { userCreated, useAppDispatch } from "@/Redux/store";
import { ROUTES } from "@/Routes/routes";
import FormField from "@/Shared/FormField";
import { getSession } from "@/Storage/session";
import { normalizeDigits } from "@/Utils/format";
import { postUser } from "@/Utils/services/userApi";
import { createUserSchema } from "@/Validations/forms.schema";
import CreateRecord from "./CreateRecord";

const INITIAL = { firstName: "", lastName: "", username: "", email: "", password: "", phone: "" };
const Fields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 16px;
`;

export default function CreateUserScreen() {
  const { m } = useMessages();
  const dispatch = useAppDispatch();
  return (
    <CreateRecord
      initial={INITIAL}
      schema={createUserSchema(m)}
      listLabel={m.users}
      listPath={ROUTES.users}
      title={m.addUser}
      save={m.saveUser}
      onSave={async (values) => {
        const session = getSession();
        const item = await postUser({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password,
          phone: normalizeDigits(values.phone.trim()),
        });
        if (getSession() === session) dispatch(userCreated({ key: crypto.randomUUID(), item }));
        return item.firstName + " " + item.lastName;
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
            label={m.password + " *"}
            placeholder={m.passwordPlaceholder}
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
