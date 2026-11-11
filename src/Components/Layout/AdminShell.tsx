import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Confirm from "@/Modals/Confirm";
import Modal from "@/Modals/Modal";
import { useToast } from "@/Shared/Toast";
import { endSession } from "@/Utils/endSession";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useMessages } from "@/Dictionary/messages";
import { ROUTES } from "@/Routes/routes";
import { Brand, IconButton } from "@/Shared/controls";
import Icon from "@/Shared/Icon";
import PreferenceControls from "@/Shared/PreferenceControls";

const Layout = styled.div`
  --sidebar: 240px;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  @media (max-width: 900px) {
    --sidebar: 0px;
  }
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
  @media (max-width: 900px) {
    display: none;
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
  .mobile-menu {
    display: none;
  }
  @media (max-width: 900px) {
    padding-inline: 16px;
    .mobile-menu {
      display: inline-flex;
      flex: none;
    }
    .profile {
      display: none;
    }
  }
  flex-wrap: wrap;
  padding-block: 10px;
  .controls,
  .profile {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .profile {
    font-size: 13px;
    @media (max-width: 900px) {
      display: none;
    }
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
  align-content: start;
  flex: 1;
  @media (max-width: 900px) {
    padding: 20px 16px;
  }
`;

const DrawerLinks = styled.nav`
  display: grid;
  gap: 10px;
  a,
  button {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px;
    color: var(--ink);
    background: var(--soft);
    border: 0;
    border-radius: 8px;
  }
`;

export default function AdminShell() {
  const { m } = useMessages();
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();
  const logout = useMutation({ mutationFn: async () => endSession() });
  const navigate = useNavigate();
  const dashboard = pathname === ROUTES.dashboard;
  const users = pathname.startsWith(ROUTES.users);
  let sectionTitle = m.productManagement;
  if (dashboard) sectionTitle = m.dashboard;
  else if (users) sectionTitle = m.userManagement;
  useEffect(() => {
    document.title = sectionTitle + " | NOVA Admin";
  }, [sectionTitle]);
  const links = (
    <>
      <NavLink to={ROUTES.dashboard} end onClick={() => setDrawer(false)}>
        <Icon name="grid" size={19} />
        {m.dashboard}
      </NavLink>
      <NavLink to={ROUTES.products} onClick={() => setDrawer(false)}>
        <Icon name="box" size={19} />
        {m.products}
      </NavLink>
      <NavLink to={ROUTES.users} onClick={() => setDrawer(false)}>
        <Icon name="users" size={19} />
        {m.users}
      </NavLink>
    </>
  );
  const signOut = (
    <button
      type="button"
      onClick={() => {
        setDrawer(false);
        setConfirm(true);
      }}
    >
      <Icon name="logout" size={18} />
      {m.signOut}
    </button>
  );
  return (
    <Layout>
      <Sidebar>
        <div>
          <Brand inverse />
          <nav aria-label={m.dashboard}>{links}</nav>
        </div>
        <div className="session">{signOut}</div>
      </Sidebar>
      <Header>
        <IconButton
          className="mobile-menu"
          type="button"
          aria-label={m.menu}
          aria-haspopup="dialog"
          onClick={() => setDrawer(true)}
        >
          <Icon name="menu" />
        </IconButton>
        <strong>{sectionTitle}</strong>
        <div className="controls">
          <PreferenceControls />
          <div className="profile">
            <span className="avatar" aria-hidden="true">
              NA
            </span>
          </div>
        </div>
      </Header>
      <Body>
        <Outlet />
      </Body>
      {drawer && (
        <Modal title="NOVA" closeLabel={m.close} onClose={() => setDrawer(false)} drawer>
          <DrawerLinks>
            {links}
            {signOut}
          </DrawerLinks>
        </Modal>
      )}
      {confirm && (
        <Confirm
          title={m.confirmLogout}
          action={logout.isPending ? m.signingOut : m.signOut}
          busy={logout.isPending}
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            const notice = toast(m.signingOut, "pending");
            void logout.mutateAsync().then((cleared) => {
              toast(
                cleared ? m.signedOutMessage : m.logoutFailed,
                cleared ? "success" : "error",
                notice
              );
              navigate(ROUTES.login, { replace: true });
            });
          }}
        />
      )}
    </Layout>
  );
}
