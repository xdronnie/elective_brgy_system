// src/main.jsx

/**
 * Application entry point.
 * Wraps the entire app with:
 * - React StrictMode for development checks
 * - AuthProvider for global authentication state
 * - AppRouter for route management
 */

import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);