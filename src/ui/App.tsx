import React, { useState, useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { createPdf } from "../application/pdf/exportPdf";
import { countDocument, filenameFromPath } from "../domain/document";
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

const App: React.FC = () => {
  const initialText = "";
  const [content, setContent] = useState<string>(initialText);
  const initialStats = countDocument(initialText);
  const [wordCount, setWordCount] = useState<number>(initialStats.words);
  const [charCount, setCharCount] = useState<number>(initialStats.characters);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [notice, setNotice] = useState<{ message: string; kind: "success" | "error" } | null>(null);
  const allowCloseRef = useRef(false);

  const notify = (message: string, kind: "success" | "error" = "success") => {
    setNotice({ message, kind });
  };

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const handleErr = (msg: any, _url: any, lineNo: any, _columnNo: any, error: any) => {
      setDebugError(`${msg} \nLine: ${lineNo} \nError: ${error?.stack || error}`);
      return false;
    };
    window.onerror = handleErr;
    window.addEventListener("unhandledrejection", (e) => {
      setDebugError(`Promise Rejection: ${e.reason?.stack || e.reason}`);
    });
  }, []);

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
        path = await selectMarkdownDestination();
        if (!path) return false;
        setCurrentFilePath(path);
      }
      await persistDocument(path, content);
      setIsDirty(false);
      notify("Document enregistré");
      return true;
    } catch (e) {
      console.error("Save failed", e);
      notify(`Impossible d’enregistrer le document : ${String(e)}`, "error");
      return false;
    }
  };

  const handleOpen = async () => {
    if (isDirty && !window.confirm("Les modifications non enregistrées seront perdues. Ouvrir un autre document ?")) {
      return;
    }
    try {
      const path = await selectDocument();
      if (path) {
        const doc = await loadDocument(path);
        setCurrentFilePath(path);
        setContent(doc.content);
        const stats = countDocument(doc.content);
        setCharCount(stats.characters);
        setWordCount(stats.words);
        setIsDirty(false);
        notify("Document ouvert");
      }
    } catch (e) {
      console.error("Open failed", e);
      notify(`Impossible d’ouvrir le document : ${String(e)}`, "error");
    }
  };

  const handleClear = () => {
    if (isDirty && !window.confirm("Créer un nouveau document et perdre les modifications non enregistrées ?")) {
      return;
    }
    setContent("");
    setWordCount(0);
    setCharCount(0);
    setCurrentFilePath(null);
    setIsDirty(false);
    notify("Nouveau document créé");
  };

  const handleExport = async () => {
    try {
      const path = await selectPdfDestination();
      if (path) {
        const bytes = await createPdf(content, filenameFromPath(currentFilePath));
        await persistBinary(path, bytes);
        notify("PDF exporté");
      }
    } catch (e) {
      console.error("Export failed", e);
      notify(`Impossible d’exporter le PDF : ${String(e)}`, "error");
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    let unlisten: (() => void) | undefined;
    getCurrentWindow().onCloseRequested(async (event) => {
      if (isDirty && !allowCloseRef.current) {
        event.preventDefault();
        if (window.confirm("Quitter Repsel sans enregistrer les modifications ?")) {
          allowCloseRef.current = true;
          await getCurrentWindow().close();
        }
      }
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
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
  }, [content, currentFilePath, isDirty]);

  const filename = filenameFromPath(currentFilePath);

  return (
    <div className="app-shell">
      <HeaderBar onOpen={handleOpen} onSave={() => void handleSave()} onSaveAs={() => void handleSave(true)} onExport={handleExport} onClear={handleClear} title={`${isDirty ? "● " : ""}Repsel — ${filename}`} />

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
      
      {debugError && (
        <div className="absolute top-12 left-0 right-0 z-50 bg-red-500 text-white p-4 overflow-auto max-h-64 whitespace-pre-wrap">
          <strong>Debug Error:</strong><br/>
          {debugError}
        </div>
      )}

      <main className="editor-stage">
        <Editor initialContent={content} onChange={handleContentChange} />
      </main>
      <StatusBar wordCount={wordCount} charCount={charCount} isDirty={isDirty} />
    </div>
  );
};

export default App;
