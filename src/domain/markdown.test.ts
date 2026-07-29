import { describe, expect, it } from "vitest";
import { buildOutline, insertCommands } from "./markdown";

describe("markdown domain", () => {
  it("builds a hierarchical outline with document positions", () => {
    expect(buildOutline("# Introduction\nTexte\n## Méthode")).toEqual([
      { level: 1, label: "Introduction", position: 0 },
      { level: 2, label: "Méthode", position: 21 },
    ]);
  });

  it("provides unique slash commands", () => {
    expect(new Set(insertCommands.map(({ id }) => id)).size).toBe(insertCommands.length);
  });
});
