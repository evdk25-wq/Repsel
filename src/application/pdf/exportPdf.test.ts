import { describe, expect, it } from "vitest";
import { markPageBreakRelationships } from "./exportPdf";

describe("PDF pagination", () => {
  it("keeps headings and list introductions with the following content", () => {
    const root = document.createElement("article");
    root.innerHTML = "<h2>Conclusion</h2><p>Le résultat est validé :</p><ul><li>Lisible</li></ul>";

    markPageBreakRelationships(root);

    const outerGroup = root.firstElementChild;
    const innerGroup = outerGroup?.lastElementChild;
    expect(outerGroup).toHaveClass("pdf-keep-together");
    expect(outerGroup?.firstElementChild?.tagName).toBe("H2");
    expect(innerGroup).toHaveClass("pdf-keep-together");
    expect(innerGroup?.children[0]?.tagName).toBe("P");
    expect(innerGroup?.children[1]?.tagName).toBe("UL");
  });

  it("does not bind an ordinary paragraph to the next paragraph", () => {
    const root = document.createElement("article");
    root.innerHTML = "<p>Premier paragraphe.</p><p>Second paragraphe.</p>";

    markPageBreakRelationships(root);

    expect(root.querySelector(".pdf-keep-together")).toBeNull();
  });
});
