import { Form, Formik } from "formik";
import { useState } from "react";
import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import { signedIn, useAppDispatch } from "@/Redux/store";
import { Banner, Brand, Button, Tile } from "@/Shared/controls";
import FormField from "@/Shared/FormField";
import Icon from "@/Shared/Icon";
import PreferenceControls from "@/Shared/PreferenceControls";
import { beginSession } from "@/Storage/session";
import { getRequestError } from "@/Utils/api/response";
import { postLogin } from "@/Utils/services/authApi";
import { createLoginSchema } from "@/Validations/forms.schema";

const Screen = styled.main`
  display: grid;
  grid-template-columns: 55% 45%;
  min-height: 100dvh;
`;
const Visual = styled.aside`
  background: #122139;
  color: white;
  padding: clamp(100px, 26.11vh, 235px) 56px 56px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  gap: 22px;
  &::before,
  &::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }
  &::before {
    border: 32px solid #263b57;
    width: 378px;
    height: 378px;
    left: -232px;
    top: -153px;
  }
  &::after {
    border: 36px solid #304766;
    width: 442px;
    height: 442px;
    right: -107px;
    bottom: -252px;
  }
  h2 {
    font-size: 49px;
    line-height: inherit;
    white-space: pre-line;
  }
  p {
    color: #bac8dd;
    font-size: 19px;
  }
  .marker {
    position: absolute;
    left: 56px;
    bottom: 82px;
    width: 78px;
    height: 5px;
    border-radius: 3px;
    background: #ff8544;
  }
  .tag {
    background: #243852;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    min-height: 40px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 700;
  }
  .tag .nova-icon {
    color: #ff8544;
  }
`;
const Login = styled.section`
  padding: 28px 38px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  justify-items: center;
  align-items: center;
  gap: 36px;
  > :first-child {
    justify-self: end;
  }
  footer {
    font-size: 12px;
    font-weight: 700;
    color: var(--muted);
  }
`;
const Card = styled(Form)`
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  width: min(446px, 100%);
  padding: 32px;
  display: grid;
  gap: 16px;
  h1 {
    font-size: 30px;
  }
  .hint {
    font-size: 15px;
    color: var(--muted);
  }
  > button {
    min-height: 48px;
  }
`;

export default function SignInScreen() {
  const { m } = useMessages();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<"credentials" | "request" | null>(null);
  return (
    <Screen>
      <Login>
        <PreferenceControls full />
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={createLoginSchema(m)}
          onSubmit={async (values) => {
            setError(null);
            try {
              const token = await postLogin({
                username: values.username.trim(),
                password: values.password,
              });
              beginSession(token);
              dispatch(signedIn());
            } catch (failure) {
              setError(getRequestError(failure) === "credentials" ? "credentials" : "request");
            }
          }}
        >
          {({ errors, submitCount, isSubmitting }) => (
            <Card noValidate>
              <Tile>
                <Icon name="lock" size={22} />
              </Tile>
              <h1>{m.loginHeading}</h1>
              <p className="hint">{m.loginHelp}</p>
              {submitCount > 0 && Object.keys(errors).length > 0 && (
                <Banner title={m.completeFields} />
              )}
              {error && (
                <Banner
                  title={error === "credentials" ? m.loginError : m.unableToLoad}
                  detail={error === "credentials" ? m.loginErrorHelp : m.requestHelp}
                />
              )}
              <FormField
                name="username"
                label={m.username}
                placeholder={m.usernamePlaceholder}
                autoComplete="username"
                disabled={isSubmitting}
              />
              <FormField
                name="password"
                type="password"
                label={m.password}
                placeholder={m.passwordPlaceholder}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? m.signingIn : m.signIn}
              </Button>
            </Card>
          )}
        </Formik>
        <footer>{m.adminFooter}</footer>
      </Login>
      <Visual>
        <Brand inverse />
        <h2>{m.brandHeadline}</h2>
        <p>{m.brandDescription}</p>
        <span className="tag">
          <Icon name="shield" size={18} />
          {m.loginTag}
        </span>
        <span className="marker" aria-hidden="true" />
      </Visual>
    </Screen>
  );
}
