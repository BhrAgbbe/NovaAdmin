import { QueryClient } from "@tanstack/react-query";

export const adminQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
    mutations: { gcTime: 0 },
  },
});

export const adminKeys = {
  products: ["admin", "products"],
  users: ["admin", "users"],
  categories: ["admin", "categories"],
  detail: (resource: "products" | "users", id: number) =>
    ["admin", resource, "detail", id] as const,
} as const;
