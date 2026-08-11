import { describe, expect, it } from "vitest";
import { renderMarkdownHtml } from "./renderHtml";

describe("renderMarkdownHtml", () => {
  it("renders Markdown and mathematical notation", async () => {
    const html = await renderMarkdownHtml("# Title\n\n$E=mc^2$");

    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("repsel-math-inline");
    expect(html).toContain("<svg");
  });

  it("removes executable markup and unsafe URLs", async () => {
    const html = await renderMarkdownHtml(
      '<script>alert(1)</script><a href="javascript:alert(1)" onclick="alert(1)">Link</a>',
    );

    expect(html).not.toContain("<script");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("onclick");
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("keeps supported embedded images", async () => {
    const html = await renderMarkdownHtml("![Photo](data:image/png;base64,iVBORw0KGgo=)");

    expect(html).toContain('src="data:image/png;base64,iVBORw0KGgo="');
  });
});
