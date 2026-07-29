import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import type { RepselDocument } from "../../domain/document";

const markdownFilter = [{ name: "Markdown", extensions: ["md"] }];

export const selectDocument = async (): Promise<string | null> => {
  const selected = await open({ multiple: false, filters: markdownFilter });
  return typeof selected === "string" ? selected : null;
};

export const selectMarkdownDestination = async (): Promise<string | null> => {
  const selected = await save({ filters: markdownFilter });
  return typeof selected === "string" ? selected : null;
};

export const selectPdfDestination = async (): Promise<string | null> => {
  const selected = await save({ filters: [{ name: "PDF", extensions: ["pdf"] }] });
  return typeof selected === "string" ? selected : null;
};

export const loadDocument = (path: string): Promise<RepselDocument> =>
  invoke("load_document", { path });

export const persistDocument = (path: string, content: string): Promise<void> =>
  invoke("save_document", { path, content });

export const persistBinary = (path: string, bytes: Uint8Array): Promise<void> =>
  invoke("save_binary_file", { path, bytes: Array.from(bytes) });
