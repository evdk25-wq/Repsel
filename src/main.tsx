import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/ibm-plex-sans/wght.css";
import "@fontsource-variable/ibm-plex-sans/wght-italic.css";
import "@fontsource-variable/source-serif-4/wght.css";
import "@fontsource-variable/source-serif-4/wght-italic.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/400-italic.css";
import "@fontsource/ibm-plex-mono/600.css";
import App from "./ui/App";
import { DocumentFontProvider } from "./ui/documentFont";
import { I18nProvider } from "./ui/i18n";
import "./ui/styles/globals.css";

const savedTheme = localStorage.getItem("repsel-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle("dark", savedTheme === "dark" || (!savedTheme && prefersDark));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DocumentFontProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </DocumentFontProvider>
  </React.StrictMode>,
);
