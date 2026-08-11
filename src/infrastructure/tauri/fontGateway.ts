import { invoke } from "@tauri-apps/api/core";

export interface SystemFont {
  family: string;
  monospace: boolean;
}

export const listSystemFonts = (): Promise<SystemFont[]> => invoke("list_system_fonts");
