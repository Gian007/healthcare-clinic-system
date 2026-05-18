import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./state/auth";
import { AdminSettingsProvider } from "./state/adminSettings";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <AdminSettingsProvider>
        <App />
      </AdminSettingsProvider>
    </AuthProvider>
  </BrowserRouter>
);
