export const ROUTES = {
  dashboard: "/",
  login: "/login",
  products: "/products",
  createProduct: "/products/new",
  users: "/users",
  createUser: "/users/new",
} as const;

export function stateDialog(value: unknown) {
  return typeof value === "object" && value !== null && "dialog" in value && value.dialog === true;
}

export function stateFrom(value: unknown) {
  return typeof value === "object" && value !== null && "from" in value ? value.from : undefined;
}

export function resolveReturnPath(path: unknown) {
  return (
    Object.values(ROUTES).find((route) => route !== ROUTES.login && route === path) ??
    ROUTES.dashboard
  );
}
