export interface DocumentStats {
  characters: number;
  words: number;
}

export interface RepselDocument {
  id: string;
  title: string;
  content: string;
}

const withoutEmbeddedImageData = (content: string): string =>
  content.replace(/data:image\/(?:png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+/gu, "");

export const countDocument = (content: string): DocumentStats => {
  const visibleContent = withoutEmbeddedImageData(content);
  return {
    characters: visibleContent.length,
    words: visibleContent.trim() ? visibleContent.trim().split(/\s+/u).length : 0,
  };
};

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
