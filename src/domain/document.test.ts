import { describe, expect, it } from "vitest";
import { countDocument, ensureFileExtension, filenameFromPath, replaceFileExtension } from "./document";

describe("document domain", () => {
  it("counts an empty document", () => {
    expect(countDocument("")).toEqual({ words: 0, characters: 0 });
  });

  it("counts words and characters", () => {
    expect(countDocument("Repsel écrit bien")).toEqual({ words: 3, characters: 17 });
  });

  it("extracts cross-platform filenames", () => {
    expect(filenameFromPath("/tmp/note.md")).toBe("note.md");
    expect(filenameFromPath("C:\\Notes\\note.md")).toBe("note.md");
    expect(filenameFromPath(null)).toBe("Sans titre");
  });

  it("guarantees visible save extensions", () => {
    expect(ensureFileExtension("/tmp/note", "md")).toBe("/tmp/note.md");
    expect(ensureFileExtension("/tmp/NOTE.MD", ".md")).toBe("/tmp/NOTE.MD");
    expect(ensureFileExtension("/tmp/export", "pdf")).toBe("/tmp/export.pdf");
    expect(replaceFileExtension("note.md", "pdf")).toBe("note.pdf");
    expect(replaceFileExtension("Sans titre", ".pdf")).toBe("Sans titre.pdf");
  });
});
