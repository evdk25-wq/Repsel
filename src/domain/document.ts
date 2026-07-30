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

export const ensureFileExtension = (path: string, extension: string): string => {
  const normalizedExtension = extension.replace(/^\./u, "");
  return path.toLocaleLowerCase().endsWith(`.${normalizedExtension.toLocaleLowerCase()}`)
    ? path
    : `${path}.${normalizedExtension}`;
};

export const replaceFileExtension = (filename: string, extension: string): string => {
  const normalizedExtension = extension.replace(/^\./u, "");
  const stem = filename.replace(/\.[^./\\]+$/u, "");
  return `${stem}.${normalizedExtension}`;
};
