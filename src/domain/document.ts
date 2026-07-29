export interface DocumentStats {
  characters: number;
  words: number;
}

export interface RepselDocument {
  id: string;
  title: string;
  content: string;
}

export const countDocument = (content: string): DocumentStats => ({
  characters: content.length,
  words: content.trim() ? content.trim().split(/\s+/u).length : 0,
});

export const filenameFromPath = (path: string | null): string =>
  path?.split(/[\\/]/u).pop() || "Sans titre";
