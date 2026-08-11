import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { listSystemFonts, type SystemFont } from "../../infrastructure/tauri/fontGateway";
import { useDocumentFont, type DocumentTypography } from "../documentFont";
import { useI18n } from "../i18n";

interface TypographyDialogProps {
  onClose: () => void;
}

const bundledFonts: SystemFont[] = [
  { family: "Source Serif 4 Variable", monospace: false },
  { family: "IBM Plex Sans Variable", monospace: false },
  { family: "IBM Plex Mono", monospace: true },
];

const TypographyDialog: React.FC<TypographyDialogProps> = ({ onClose }) => {
  const { typography, previewTypography, restoreTypography, saveTypography } = useDocumentFont();
  const { t } = useI18n();
  const [draft, setDraft] = useState<DocumentTypography>(typography);
  const [fonts, setFonts] = useState<SystemFont[]>(bundledFonts);
  const [monospaceOnly, setMonospaceOnly] = useState(false);

  useEffect(() => {
    let active = true;
    void listSystemFonts()
      .then((systemFonts) => {
        if (!active) return;
        const merged = new Map<string, SystemFont>();
        [...bundledFonts, ...systemFonts].forEach((font) => {
          const previous = merged.get(font.family);
          merged.set(font.family, { ...font, monospace: font.monospace || previous?.monospace === true });
        });
        setFonts([...merged.values()].sort((left, right) => left.family.localeCompare(right.family)));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const visibleFonts = useMemo(
    () => monospaceOnly ? fonts.filter((font) => font.monospace) : fonts,
    [fonts, monospaceOnly],
  );

  const updateDraft = (next: DocumentTypography) => {
    setDraft(next);
    previewTypography(next);
  };

  const cancel = () => {
    restoreTypography();
    onClose();
  };

  const apply = () => {
    saveTypography(draft);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") cancel();
      if (event.key === "Enter" && !event.shiftKey) apply();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [draft, typography]);

  return createPortal(
    <div className="typography-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && cancel()}>
      <section className="typography-dialog" role="dialog" aria-modal="true" aria-labelledby="typography-title">
        <header className="typography-dialog-header">
          <div>
            <span className="typography-dialog-label">REPSEL</span>
            <h2 id="typography-title">{t("typography")}</h2>
          </div>
          <button className="typography-close" onClick={cancel} aria-label={t("close")}>×</button>
        </header>

        <div className="typography-fields">
          <label className="typography-field typography-field-family">
            <span>{t("fontFamily")}</span>
            <select value={draft.family} onChange={(event) => updateDraft({ ...draft, family: event.target.value })}>
              {visibleFonts.map((font) => <option key={font.family} value={font.family}>{font.family}</option>)}
            </select>
          </label>
          <label className="typography-field typography-field-size">
            <span>{t("fontSize")}</span>
            <input
              type="number"
              min="10"
              max="32"
              value={draft.size}
              onChange={(event) => updateDraft({ ...draft, size: Number(event.target.value) })}
            />
          </label>
          <label className="typography-field typography-field-spacing">
            <span>{t("lineSpacing")}</span>
            <select value={draft.lineHeight} onChange={(event) => updateDraft({ ...draft, lineHeight: event.target.value as DocumentTypography["lineHeight"] })}>
              <option value="compact">{t("spacingCompact")}</option>
              <option value="normal">{t("spacingNormal")}</option>
              <option value="comfortable">{t("spacingComfortable")}</option>
            </select>
          </label>
        </div>

        <div
          className="typography-preview"
          style={{
            fontFamily: `${JSON.stringify(draft.family)}, serif`,
            fontSize: draft.size,
            lineHeight: draft.lineHeight === "compact" ? 1.42 : draft.lineHeight === "comfortable" ? 1.82 : 1.62,
          }}
        >
          <span>{t("fontPreview")}</span>
          <strong>AaBbCc XxYyZz</strong>
          <p>Repsel — 0123456789</p>
        </div>

        <label className="typography-filter">
          <input
            type="checkbox"
            checked={monospaceOnly}
            onChange={(event) => {
              const checked = event.target.checked;
              setMonospaceOnly(checked);
              if (checked && !fonts.find((font) => font.family === draft.family)?.monospace) {
                const firstMonospace = fonts.find((font) => font.monospace);
                if (firstMonospace) updateDraft({ ...draft, family: firstMonospace.family });
              }
            }}
          />
          <span>{t("monospaceOnly")}</span>
        </label>

        <footer className="typography-actions">
          <button className="confirm-button" onClick={cancel}>{t("cancel")}</button>
          <button className="confirm-button confirm-button-primary" onClick={apply}>{t("apply")}</button>
        </footer>
      </section>
    </div>,
    document.body,
  );
};

export default TypographyDialog;
