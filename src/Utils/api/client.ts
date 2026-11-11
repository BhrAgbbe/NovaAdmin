import axios from "axios";

export const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_FAKE_STORE_API_URL || "https://fakestoreapi.com",
  adapter: "fetch",
  fetchOptions: { cache: "no-store" },
  timeout: 10000,
  headers: { Accept: "application/json" },
});
