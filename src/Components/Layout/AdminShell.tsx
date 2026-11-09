import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import { signedOut, useAppDispatch } from "@/Redux/store";
import { ROUTES } from "@/Routes/routes";
import { Brand } from "@/Shared/controls";
import Icon from "@/Shared/Icon";
import PreferenceControls from "@/Shared/PreferenceControls";
import { clearSession } from "@/Storage/session";

const Layout = styled.div`
  --sidebar: 240px;
  min-height: 100dvh;
  padding-inline-start: var(--sidebar);
`;
const Sidebar = styled.aside`
  background: #122139;
  color: #bac8dd;
  position: fixed;
  inset-block: 0;
  inset-inline-start: 0;
  inline-size: var(--sidebar);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 16px;
  overflow: auto;
  .workspace {
    margin: 26px 0 8px;
    font-weight: 700;
    font-size: 12px;
  }
  nav {
    display: grid;
    gap: 8px;
  }
  a,
  button {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 48px;
    padding-inline: 12px;
    border-radius: 10px;
    border: 1px solid transparent;
    font-size: 15px;
  }
  a:hover,
  a.active {
    background: #2a3e5b;
    color: white;
    border-color: #435978;
    font-weight: 700;
  }
  a.active .nova-icon {
    color: #ff8544;
  }
  .session {
    border-block-start: 1px solid #344862;
    padding-block-start: 12px;
  }
  button {
    background: transparent;
    color: white;
    width: 100%;
    font-weight: 700;
  }
  button:hover {
    background: #2a3e5b;
  }
  small {
    font-size: 11px;
    font-weight: 700;
    display: block;
    margin-block-start: 8px;
  }
`;
const Header = styled.header`
  min-height: 77px;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border-block-end: 1px solid var(--line);
  background: var(--surface);
  font-size: 15px;
  .controls,
  .profile {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .profile {
    font-size: 13px;
  }
  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--tint);
    color: var(--brand-ink);
    display: grid;
    place-items: center;
    font:
      700 12px Inter,
      sans-serif;
  }
`;
const Body = styled.main`
  padding: 28px 32px;
  display: grid;
  gap: 18px;
`;

export default function AdminShell() {
  const { m } = useMessages();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const users = pathname.startsWith(ROUTES.users);
  return (
    <Layout>
      <Sidebar>
        <div>
          <Brand inverse />
          <p className="workspace">{m.workspace}</p>
          <nav aria-label={m.workspace}>
            <NavLink to={ROUTES.products}>
              <Icon name="box" size={19} />
              {m.products}
            </NavLink>
            <NavLink to={ROUTES.users}>
              <Icon name="users" size={19} />
              {m.users}
            </NavLink>
          </nav>
        </div>
        <div className="session">
          <button
            type="button"
            onClick={() => {
              clearSession();
              dispatch(signedOut());
              navigate(ROUTES.login, { replace: true });
            }}
          >
            <Icon name="logout" size={18} />
            {m.signOut}
          </button>
          <small className="latin">NOVA / OPERATIONS</small>
        </div>
      </Sidebar>
      <Header>
        <strong>{users ? m.userManagement : m.productManagement}</strong>
        <div className="controls">
          <PreferenceControls />
          <div className="profile">
            <span className="avatar" aria-hidden="true">
              NA
            </span>
            <strong>{m.admin}</strong>
          </div>
        </div>
      </Header>
      <Body>
        <Outlet />
      </Body>
    </Layout>
  );
}
