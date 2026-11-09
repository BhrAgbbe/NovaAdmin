import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AdminShell from "@/Components/Layout/AdminShell";
import LoginPage from "@/Pages/LoginPage";
import ProductsPage from "@/Pages/ProductsPage";
import UsersPage from "@/Pages/UsersPage";
import CreateProductPage from "@/Pages/CreateProductPage";
import CreateUserPage from "@/Pages/CreateUserPage";
import { useAppSelector } from "@/Redux/store";
import { resolveReturnPath, ROUTES } from "./routes";

function RequireSession() {
  const authenticated = useAppSelector((state) => state.session.authenticated);
  const { pathname } = useLocation();
  return authenticated ? (
    <Outlet />
  ) : (
    <Navigate to={ROUTES.login} replace state={{ from: pathname }} />
  );
}

function LoginRoute() {
  const authenticated = useAppSelector((state) => state.session.authenticated);
  const { state } = useLocation();
  return authenticated ? <Navigate to={resolveReturnPath(state?.from)} replace /> : <LoginPage />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.login} element={<LoginRoute />} />
      <Route element={<RequireSession />}>
        <Route element={<AdminShell />}>
          <Route path={ROUTES.products} element={<ProductsPage />} />
          <Route path={ROUTES.users} element={<UsersPage />} />
          <Route path={ROUTES.createProduct} element={<CreateProductPage />} />
          <Route path={ROUTES.createUser} element={<CreateUserPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.products} replace />} />
    </Routes>
  );
}
