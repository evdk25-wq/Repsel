import React from "react";
import ReactDOM from "react-dom/client";
import App from "./ui/App";
import { I18nProvider } from "./ui/i18n";
import "./ui/styles/globals.css";

const savedTheme = localStorage.getItem("repsel-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark", savedTheme === "dark" || (!savedTheme && prefersDark));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
);
