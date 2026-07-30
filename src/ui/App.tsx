import React, { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { createPdf } from "../application/pdf/exportPdf";
import { countDocument, filenameFromPath, replaceFileExtension } from "../domain/document";
import {
  loadDocument,
  persistBinary,
  persistDocument,
  selectDocument,
  selectMarkdownDestination,
  selectPdfDestination,
} from "../infrastructure/tauri/documentGateway";
import HeaderBar from "./components/HeaderBar";
import Editor from "./components/Editor";
import StatusBar from "./components/StatusBar";
import { useI18n } from "./i18n";

const App: React.FC = () => {
  const { locale, t } = useI18n();
  const initialText = "";
  const [content, setContent] = useState<string>(initialText);
  const initialStats = countDocument(initialText);
  const [wordCount, setWordCount] = useState<number>(initialStats.words);
  const [charCount, setCharCount] = useState<number>(initialStats.characters);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [editorSession, setEditorSession] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [notice, setNotice] = useState<{ message: string; kind: "success" | "error" } | null>(null);

  const notify = (message: string, kind: "success" | "error" = "success") => {
    setNotice({ message, kind });
  };

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    const stats = countDocument(newContent);
    setCharCount(stats.characters);
    setWordCount(stats.words);
    setIsDirty(true);
  };

  const handleSave = async (saveAs = false): Promise<boolean> => {
    try {
      let path = saveAs ? null : currentFilePath;
      if (!path) {
        path = await selectMarkdownDestination(
          currentFilePath ? filenameFromPath(currentFilePath) : `${t("untitled")}.md`,
        );
        if (!path) return false;
        setCurrentFilePath(path);
      }
      await persistDocument(path, content);
      setIsDirty(false);
      notify(`${t("saved")} : ${filenameFromPath(path)}`);
      return true;
    } catch (e) {
      notify(`${t("saveError")} : ${String(e)}`, "error");
      return false;
    }
  };

  const handleOpen = async () => {
    if (isDirty && !window.confirm(t("openDiscard"))) {
      return;
    }
    try {
      const path = await selectDocument();
      if (path) {
        const doc = await loadDocument(path);
        setCurrentFilePath(path);
        setContent(doc.content);
        setEditorSession((session) => session + 1);
        const stats = countDocument(doc.content);
        setCharCount(stats.characters);
        setWordCount(stats.words);
        setIsDirty(false);
        notify(t("opened"));
      }
    } catch (e) {
      notify(`${t("openError")} : ${String(e)}`, "error");
    }
  };

  const handleClear = () => {
    if (isDirty && !window.confirm(t("newDiscard"))) {
      return;
    }
    setContent("");
    setWordCount(0);
    setCharCount(0);
    setCurrentFilePath(null);
    setEditorSession((session) => session + 1);
    setIsDirty(false);
    notify(t("created"));
  };

  const handleExport = async () => {
    try {
      const suggestedName = replaceFileExtension(
        currentFilePath ? filenameFromPath(currentFilePath) : t("untitled"),
        "pdf",
      );
      const path = await selectPdfDestination(suggestedName);
      if (path) {
        const bytes = await createPdf(content, filenameFromPath(currentFilePath));
        await persistBinary(path, bytes);
        notify(`${t("exported")} : ${filenameFromPath(path)}`);
      }
    } catch (e) {
      notify(`${t("exportError")} : ${String(e)}`, "error");
    }
  };

  const destroyWindow = async () => {
    await getCurrentWindow().destroy();
  };

  const requestClose = () => {
    if (isDirty) {
      setIsCloseDialogOpen(true);
      return;
    }
    void destroyWindow();
  };

  const saveAndClose = async () => {
    if (await handleSave()) {
      await destroyWindow();
    }
  };

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    getCurrentWindow().onCloseRequested((event) => {
      event.preventDefault();
      if (isDirty) {
        setIsCloseDialogOpen(true);
      } else {
        void destroyWindow();
      }
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      unlisten?.();
    };
  }, [isDirty]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        void handleSave(e.shiftKey);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        void handleOpen();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleClear();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, currentFilePath, isDirty, locale]);

  const filename = currentFilePath ? filenameFromPath(currentFilePath) : t("untitled");

  return (
    <div className="app-shell">
      <HeaderBar onOpen={handleOpen} onSave={() => void handleSave()} onSaveAs={() => void handleSave(true)} onExport={handleExport} onClear={handleClear} onClose={requestClose} title={`${isDirty ? "● " : ""}Repsel — ${filename}`} />

      {notice && (
        <div
          role="status"
          className={`absolute top-14 right-4 z-[60] max-w-md rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
            notice.kind === "error" ? "bg-red-600" : "bg-emerald-600"
          }`}
        >
          {notice.message}
        </div>
      )}
      
      <main className="editor-stage">
        <Editor key={editorSession} initialContent={content} onChange={handleContentChange} />
      </main>
      <StatusBar wordCount={wordCount} charCount={charCount} isDirty={isDirty} />

      {isCloseDialogOpen && (
        <div className="confirm-overlay" role="presentation">
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="close-dialog-title">
            <div className="confirm-dialog-copy">
              <span className="confirm-dialog-label">REPSEL</span>
              <h2 id="close-dialog-title">{t("closeTitle")}</h2>
              <p>{t("closeCopy")}</p>
            </div>
            <div className="confirm-dialog-actions">
              <button className="confirm-button" onClick={() => setIsCloseDialogOpen(false)}>{t("cancel")}</button>
              <button className="confirm-button confirm-button-danger" onClick={() => void destroyWindow()}>{t("discardAndQuit")}</button>
              <button className="confirm-button confirm-button-primary" onClick={() => void saveAndClose()}>{t("saveAndQuit")}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default App;
