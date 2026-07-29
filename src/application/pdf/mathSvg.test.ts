import { describe, expect, it } from "vitest";
import { renderMathSvg } from "./mathSvg";

describe("renderMathSvg", () => {
  it("renders fractions as self-contained SVG paths", () => {
    const result = renderMathSvg(String.raw`\frac{1}{\sigma\sqrt{2\pi}}`, true);

    expect(result).toContain('class="repsel-math-display"');
    expect(result).toContain("<svg");
    expect(result).toContain("<path");
  });

  it("preserves the full aspect ratio of inline formulas", () => {
    const result = renderMathSvg(String.raw`E=mc^2`, false);

    expect(result).toMatch(
      /class="repsel-math-inline" style="width:\d+\.\d{3}em;height:1\.35em"/u,
    );
  });

  it("renders matrices without relying on positioned HTML glyphs", () => {
    const result = renderMathSvg(
      String.raw`A=\begin{pmatrix}1&2&3\\4&5&6\\7&8&9\end{pmatrix}`,
      true,
    );

    expect(result).toContain("<svg");
    expect(result).not.toContain("katex");
  });
});
