import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ProgramaProvider } from "./context/ProgramaContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import themeUtil from './utils/theme';

// Aplicar tema inicial lo antes posible para evitar parpadeo (flash)
try { themeUtil.applyTheme(); themeUtil.applyContrast(); } catch { /* noop */ }

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ProgramaProvider>
        <App />
      </ProgramaProvider>
    </AuthProvider>
  </React.StrictMode>
);
