import { invoke } from "@tauri-apps/api/core";
import type { RepselDocument } from "../../domain/document";

export const selectDocument = (): Promise<string | null> =>
  invoke("select_document");

export const selectMarkdownDestination = (defaultPath: string): Promise<string | null> =>
  invoke("select_markdown_destination", { defaultPath });

export const selectPdfDestination = (defaultPath: string): Promise<string | null> =>
  invoke("select_pdf_destination", { defaultPath });

export const loadDocument = (path: string): Promise<RepselDocument> =>
  invoke("load_document", { path });

export const persistDocument = (path: string, content: string): Promise<void> =>
  invoke("save_document", { path, content });

export const persistBinary = (path: string, bytes: Uint8Array): Promise<void> =>
  invoke("save_binary_file", { path, bytes: Array.from(bytes) });
