import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ProgramaProvider } from "./context/ProgramaContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ProgramaProvider>
        <App />
      </ProgramaProvider>
    </AuthProvider>
  </React.StrictMode>
);
