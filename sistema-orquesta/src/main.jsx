import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ProgramaProvider } from "./context/ProgramaContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ProgramaProvider>
      <App />
    </ProgramaProvider>
  </React.StrictMode>
);
