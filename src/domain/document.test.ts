import { describe, expect, it } from "vitest";
import { countDocument, filenameFromPath } from "./document";

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
});
