import { QueryClientProvider } from "@tanstack/react-query";
import { useMessages } from "@/Dictionary/messages";
import { ToastProvider } from "@/Shared/Toast";
import SessionMonitor from "@/Components/Auth/SessionMonitor";
import { adminQueryClient } from "@/Utils/api/query";
import { StrictMode, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@/Routes/AppRoutes";
import { store, useAppSelector } from "@/Redux/store";
import { GlobalStyle } from "@/Shared/GlobalStyle";
import "@/assets/Fonts/fonts.css";
import "@/assets/Icons/icons.css";

function App() {
  const { m } = useMessages();
  const { locale, mode } = useAppSelector((state) => state.preferences);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === "fa" ? "rtl" : "ltr";
    root.dataset.theme = mode;
  }, [locale, mode]);

  return (
    <>
      <GlobalStyle />
      <ToastProvider closeLabel={m.dismissToast}>
        <SessionMonitor />
        <AppRoutes />
      </ToastProvider>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <QueryClientProvider client={adminQueryClient}>
          <App />
        </QueryClientProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
