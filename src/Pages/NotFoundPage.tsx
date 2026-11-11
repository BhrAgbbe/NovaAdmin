import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import { ROUTES } from "@/Routes/routes";
import { Brand, ButtonLink } from "@/Shared/controls";
import Icon from "@/Shared/Icon";

const Page = styled.main`
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: var(--soft);
  color: var(--ink);
  section {
    width: min(100%, 560px);
    padding: clamp(24px, 5vw, 56px);
    display: grid;
    justify-items: start;
    gap: 18px;
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 20px;
    box-shadow: 0 18px 48px #07132918;
  }
  .code { color: var(--brand-ink); font: 800 clamp(72px, 18vw, 132px)/1 Inter, sans-serif; }
  h1 { font-size: clamp(24px, 5vw, 34px); }
  p { color: var(--muted); }
`;

export default function NotFoundPage() {
  const { m } = useMessages();
  return (
    <Page>
      <section>
        <Brand />
        <span className="code" aria-hidden="true">404</span>
        <h1>{m.notFoundTitle}</h1>
        <p>{m.notFoundHelp}</p>
        <ButtonLink to={ROUTES.dashboard}><Icon name="arrow" size={18} directional />{m.returnDashboard}</ButtonLink>
      </section>
    </Page>
  );
}
