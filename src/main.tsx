/**
 * Entry point (Requirements 3.4, 12.4).
 *
 * Import order is load-bearing:
 *   1. `@/styles/tokens.css`   — defines the `:root` / `.dark` CSS
 *      variables that every shadcn primitive and every Tailwind token
 *      utility reads. Must be first so any stylesheet imported after
 *      it can resolve `hsl(var(--...))` references.
 *   2. `@/styles/globals.css`  — Tailwind base/components/utilities
 *      plus shadcn layer placeholders. Sits on top of the tokens.
 *   3. Module imports (React, App).
 *
 * `<App />` is rendered inside `React.StrictMode` so hydration and effect
 * double-invocations surface bugs during development.
 */

// Tokens MUST be imported before any other stylesheet so that shadcn/ui
// primitives and Tailwind token-mapped utilities pick up the CSS
// variables defined on :root / .dark (Requirement 3.4).
import "@/styles/tokens.css";
import "@/styles/globals.css";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "@/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
