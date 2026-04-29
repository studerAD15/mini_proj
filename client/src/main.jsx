import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(8, 8, 26, 0.95)",
          color: "#e8f0fe",
          border: "1px solid rgba(255,255,255,0.08)",
          fontFamily: '"Space Mono", monospace',
          fontSize: "0.85rem",
          backdropFilter: "blur(12px)",
          borderRadius: "0.75rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        },
        success: {
          iconTheme: { primary: "#c1d722", secondary: "#050510" },
        },
        error: {
          iconTheme: { primary: "#8aa300", secondary: "#050510" },
        },
      }}
    />
    <App />
  </React.StrictMode>
);

