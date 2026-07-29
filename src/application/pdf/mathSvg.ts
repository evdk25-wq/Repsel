import { liteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "@mathjax/src/js/handlers/html.js";
import "@mathjax/src/js/input/tex/ams/AmsConfiguration.js";
import { TeX } from "@mathjax/src/js/input/tex.js";
import { mathjax } from "@mathjax/src/js/mathjax.js";
import { SVG } from "@mathjax/src/js/output/svg.js";

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const documentNode = mathjax.document("", {
  InputJax: new TeX({ packages: ["base", "ams"] }),
  OutputJax: new SVG({ fontCache: "local" }),
});

const extractSvg = (markup: string): string => {
  const start = markup.indexOf("<svg");
  const end = markup.lastIndexOf("</svg>");
  if (start < 0 || end < 0) {
    throw new Error("MathJax n'a pas produit de rendu SVG.");
  }
  return markup.slice(start, end + 6);
};

const inlineDimensions = (svg: string): string => {
  const viewBox = svg.match(/viewBox="([^"]+)"/u);
  if (!viewBox) return "";

  const values = viewBox[1].trim().split(/\s+/u).map(Number);
  if (values.length !== 4) return "";

  const width = values[2];
  const height = values[3];
  if (!Number.isFinite(width) || !Number.isFinite(height) || height <= 0) return "";

  const heightEm = 1.35;
  const widthEm = Math.max(0.5, (width / height) * heightEm);
  return ` style="width:${widthEm.toFixed(3)}em;height:${heightEm}em"`;
};

export const renderMathSvg = (expression: string, displayMode: boolean): string => {
  const node = documentNode.convert(expression.trim(), { display: displayMode });
  const svg = extractSvg(adaptor.outerHTML(node));
  const className = displayMode ? "repsel-math-display" : "repsel-math-inline";
  const dimensions = displayMode ? "" : inlineDimensions(svg);
  return `<span class="${className}"${dimensions}>${svg}</span>`;
};
