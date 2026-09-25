import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { BrowserRouter } from "react-router-dom";
import AuthInitializer from "./components/auth/AuthInitializer.jsx";
import { getInitialTheme, applyTheme } from "./hooks/useTheme.js";

applyTheme(getInitialTheme());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthInitializer>
          <App />
        </AuthInitializer>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
