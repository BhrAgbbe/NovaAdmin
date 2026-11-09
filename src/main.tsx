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
      <AppRoutes />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
