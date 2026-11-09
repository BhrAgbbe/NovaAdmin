export const ROUTES = {
  login: "/login",
  products: "/products",
  createProduct: "/products/new",
  users: "/users",
  createUser: "/users/new",
} as const;

export function resolveReturnPath(path: unknown) {
  return (
    Object.values(ROUTES).find((route) => route !== ROUTES.login && route === path) ??
    ROUTES.products
  );
}
