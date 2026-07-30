import React, { createContext, useContext, useMemo, useState } from "react";

export type Locale = "fr" | "en";

const fr = {
  mainMenu: "Menu principal",
  file: "Fichier",
  edit: "Édition",
  settings: "Réglages",
  open: "Ouvrir…",
  openDocument: "Ouvrir un document",
  save: "Enregistrer",
  saveAs: "Enregistrer sous…",
  exportPdf: "Exporter en PDF",
  newDocument: "Nouveau",
  toggleTheme: "Basculer le thème",
  language: "Langue",
  french: "Français",
  english: "English",
  minimize: "Réduire",
  maximize: "Agrandir",
  close: "Fermer",
  documentTools: "Outils du document",
  outlineTitle: "Plan du document",
  insertBlock: "Insérer un bloc",
  document: "Document",
  outline: "Plan",
  insert: "Insérer",
  emptyOutline: "Ajoutez un titre pour construire le plan du document.",
  markdownEditor: "Éditeur Markdown",
  welcome: "Bienvenue dans Repsel",
  welcomeCopy: "Un espace calme pour structurer vos idées et écrire sans distraction.",
  startWriting: "Commencer à écrire",
  noCommand: "Aucune commande correspondante",
  quickFormatting: "Mise en forme rapide",
  mainTitle: "Titre principal",
  bold: "Gras",
  italic: "Italique",
  link: "Lien",
  inlineCode: "Code en ligne",
  code: "Code",
  formula: "Formule",
  unsaved: "Modifications non enregistrées",
  upToDate: "Document à jour",
  word: "mot",
  words: "mots",
  character: "caractère",
  characters: "caractères",
  untitled: "Sans titre",
  saved: "Document enregistré",
  opened: "Document ouvert",
  created: "Nouveau document créé",
  exported: "PDF exporté",
  saveError: "Impossible d’enregistrer le document",
  openError: "Impossible d’ouvrir le document",
  exportError: "Impossible d’exporter le PDF",
  openDiscard: "Les modifications non enregistrées seront perdues. Ouvrir un autre document ?",
  newDiscard: "Créer un nouveau document et perdre les modifications non enregistrées ?",
  closeTitle: "Modifications non enregistrées",
  closeCopy: "Voulez-vous enregistrer le document avant de quitter Repsel ?",
  cancel: "Annuler",
  discardAndQuit: "Quitter sans enregistrer",
  saveAndQuit: "Enregistrer et quitter",
  commandTitle: "Titre principal",
  commandSection: "Nouvelle section",
  commandQuote: "Citation",
  commandList: "Liste à puces",
  commandTask: "Liste de tâches",
  commandCode: "Bloc de code",
  commandFormula: "Formule mathématique",
  commandTable: "Tableau",
  placeholderTitle: "Titre",
  placeholderSection: "Section",
  placeholderQuote: "Citation",
  placeholderItem: "Élément",
  placeholderTask: "Tâche",
  placeholderColumn: "Colonne",
  placeholderValue: "Valeur",
  placeholderText: "Texte",
} as const;

type TranslationKey = keyof typeof fr;

const en: Record<TranslationKey, string> = {
  mainMenu: "Main menu",
  file: "File",
  edit: "Edit",
  settings: "Settings",
  open: "Open…",
  openDocument: "Open a document",
  save: "Save",
  saveAs: "Save as…",
  exportPdf: "Export as PDF",
  newDocument: "New",
  toggleTheme: "Toggle theme",
  language: "Language",
  french: "Français",
  english: "English",
  minimize: "Minimize",
  maximize: "Maximize",
  close: "Close",
  documentTools: "Document tools",
  outlineTitle: "Document outline",
  insertBlock: "Insert a block",
  document: "Document",
  outline: "Outline",
  insert: "Insert",
  emptyOutline: "Add a heading to build the document outline.",
  markdownEditor: "Markdown editor",
  welcome: "Welcome to Repsel",
  welcomeCopy: "A calm space to shape your ideas and write without distraction.",
  startWriting: "Start writing",
  noCommand: "No matching command",
  quickFormatting: "Quick formatting",
  mainTitle: "Main heading",
  bold: "Bold",
  italic: "Italic",
  link: "Link",
  inlineCode: "Inline code",
  code: "Code",
  formula: "Formula",
  unsaved: "Unsaved changes",
  upToDate: "Document up to date",
  word: "word",
  words: "words",
  character: "character",
  characters: "characters",
  untitled: "Untitled",
  saved: "Document saved",
  opened: "Document opened",
  created: "New document created",
  exported: "PDF exported",
  saveError: "Unable to save the document",
  openError: "Unable to open the document",
  exportError: "Unable to export the PDF",
  openDiscard: "Unsaved changes will be lost. Open another document?",
  newDiscard: "Create a new document and discard unsaved changes?",
  closeTitle: "Unsaved changes",
  closeCopy: "Would you like to save the document before leaving Repsel?",
  cancel: "Cancel",
  discardAndQuit: "Quit without saving",
  saveAndQuit: "Save and quit",
  commandTitle: "Main heading",
  commandSection: "New section",
  commandQuote: "Quote",
  commandList: "Bullet list",
  commandTask: "Task list",
  commandCode: "Code block",
  commandFormula: "Mathematical formula",
  commandTable: "Table",
  placeholderTitle: "Title",
  placeholderSection: "Section",
  placeholderQuote: "Quote",
  placeholderItem: "Item",
  placeholderTask: "Task",
  placeholderColumn: "Column",
  placeholderValue: "Value",
  placeholderText: "Text",
};

const translations: Record<Locale, Record<TranslationKey, string>> = { fr, en };

const detectLocale = (): Locale => {
  const saved = localStorage.getItem("repsel-locale");
  if (saved === "fr" || saved === "en") return saved;
  return navigator.language.toLocaleLowerCase().startsWith("fr") ? "fr" : "en";
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "fr",
  setLocale: () => undefined,
  t: (key) => fr[key],
});

export const I18nProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);
  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale: (nextLocale) => {
      localStorage.setItem("repsel-locale", nextLocale);
      document.documentElement.lang = nextLocale;
      setLocaleState(nextLocale);
    },
    t: (key) => translations[locale][key],
  }), [locale]);

  document.documentElement.lang = locale;
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => useContext(I18nContext);
