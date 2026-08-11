import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface DocumentTypography {
  family: string;
  size: number;
  lineHeight: "compact" | "normal" | "comfortable";
}

const storageKey = "repsel-document-typography";
const legacyStorageKey = "repsel-document-font";
const defaultTypography: DocumentTypography = { family: "Source Serif 4 Variable", size: 16, lineHeight: "normal" };

const normalizeTypography = (value: Partial<DocumentTypography>): DocumentTypography => ({
  family: typeof value.family === "string" && value.family.trim().length > 0 && value.family.length <= 120
    ? value.family.trim()
    : defaultTypography.family,
  size: typeof value.size === "number" && Number.isFinite(value.size)
    ? Math.min(32, Math.max(10, Math.round(value.size)))
    : defaultTypography.size,
  lineHeight: value.lineHeight === "compact" || value.lineHeight === "comfortable" ? value.lineHeight : "normal",
});

const readTypography = (): DocumentTypography => {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) return normalizeTypography(JSON.parse(saved));
  } catch {
    localStorage.removeItem(storageKey);
  }

  const legacy = localStorage.getItem(legacyStorageKey);
  if (legacy === "sans") return { family: "IBM Plex Sans Variable", size: 16, lineHeight: "normal" };
  if (legacy === "mono") return { family: "IBM Plex Mono", size: 16, lineHeight: "normal" };
  return defaultTypography;
};

const applyTypography = ({ family, size, lineHeight }: DocumentTypography) => {
  document.documentElement.style.setProperty("--font-document", `${JSON.stringify(family)}, serif`);
  document.documentElement.style.setProperty("--font-document-size", `${size}px`);
  document.documentElement.style.setProperty("--font-document-line-height", lineHeight === "compact" ? "1.42" : lineHeight === "comfortable" ? "1.82" : "1.62");
};

interface DocumentFontContextValue {
  typography: DocumentTypography;
  previewTypography: (typography: DocumentTypography) => void;
  saveTypography: (typography: DocumentTypography) => void;
  restoreTypography: () => void;
}

const DocumentFontContext = createContext<DocumentFontContextValue>({
  typography: defaultTypography,
  previewTypography: () => undefined,
  saveTypography: () => undefined,
  restoreTypography: () => undefined,
});

export const DocumentFontProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [typography, setTypography] = useState<DocumentTypography>(readTypography);

  useEffect(() => applyTypography(typography), [typography]);

  const value = useMemo<DocumentFontContextValue>(() => ({
    typography,
    previewTypography: (draft) => applyTypography(normalizeTypography(draft)),
    saveTypography: (draft) => {
      const next = normalizeTypography(draft);
      localStorage.setItem(storageKey, JSON.stringify(next));
      localStorage.removeItem(legacyStorageKey);
      applyTypography(next);
      setTypography(next);
    },
    restoreTypography: () => applyTypography(typography),
  }), [typography]);

  return <DocumentFontContext.Provider value={value}>{children}</DocumentFontContext.Provider>;
};

export const useDocumentFont = (): DocumentFontContextValue => useContext(DocumentFontContext);
