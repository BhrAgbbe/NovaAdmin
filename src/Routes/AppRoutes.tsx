import { Skeleton } from "@/Shared/Skeleton";
import { lazy, Suspense } from "react";
import { useMessages } from "@/Dictionary/messages";
import { getSession } from "@/Storage/session";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AdminShell from "@/Components/Layout/AdminShell";
import { useAppSelector } from "@/Redux/store";
import { resolveReturnPath, ROUTES, stateFrom } from "./routes";

const DashboardPage = lazy(() => import("@/Pages/DashboardPage"));
const LoginPage = lazy(() => import("@/Pages/LoginPage"));
const ProductsPage = lazy(() => import("@/Pages/ProductsPage"));
const UsersPage = lazy(() => import("@/Pages/UsersPage"));
const CreateProductPage = lazy(() => import("@/Pages/CreateProductPage"));
const CreateUserPage = lazy(() => import("@/Pages/CreateUserPage"));
const NotFoundPage = lazy(() => import("@/Pages/NotFoundPage"));

function RequireSession() {
  const authenticated = useAppSelector((state) => state.session.authenticated);
  const { pathname } = useLocation();
  return authenticated && getSession() ? (
    <Outlet />
  ) : (
    <Navigate to={ROUTES.login} replace state={{ from: pathname }} />
  );
}

function LoginRoute() {
  const authenticated = useAppSelector((state) => state.session.authenticated);
  const { state } = useLocation();
  return authenticated && getSession() ? (
    <Navigate to={resolveReturnPath(stateFrom(state))} replace />
  ) : (
    <LoginPage />
  );
}

export default function AppRoutes() {
  const { m } = useMessages();
  return (
    <Suspense
      fallback={
        <Skeleton role="status" aria-label={m.loading} style={{ height: 160, margin: 24 }} />
      }
    >
      <Routes>
        <Route path={ROUTES.login} element={<LoginRoute />} />
        <Route element={<RequireSession />}>
          <Route element={<AdminShell />}>
            <Route path={ROUTES.dashboard} element={<DashboardPage />} />
            <Route path={ROUTES.products} element={<ProductsPage />} />
            <Route path={ROUTES.users} element={<UsersPage />} />
            <Route path={ROUTES.createProduct} element={<CreateProductPage />} />
            <Route path={ROUTES.createUser} element={<CreateUserPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
