import { marked } from "marked";

interface HtmlToPdfWorker {
  set(options: object): HtmlToPdfWorker;
  from(element: HTMLElement): HtmlToPdfWorker;
  toCanvas(): HtmlToPdfWorker;
  toPdf(): HtmlToPdfWorker;
  output(type: "arraybuffer"): Promise<ArrayBuffer>;
}

type HtmlToPdfFactory = () => HtmlToPdfWorker;

const renderMath = async (
  markdown: string,
): Promise<{ source: string; fragments: Map<string, string> }> => {
  const { renderMathSvg } = await import("./mathSvg");
  const fragments = new Map<string, string>();
  let index = 0;
  const replace = (expression: string, displayMode: boolean) => {
    const token = `REPSELMATH${index++}TOKEN`;
    fragments.set(token, renderMathSvg(expression, displayMode));
    return token;
  };

  const blocks = markdown.replace(/\$\$([\s\S]+?)\$\$/gu, (_, expression: string) => replace(expression, true));
  const source = blocks.replace(/\$([^$\n]+?)\$/gu, (_, expression: string) => replace(expression, false));
  return { source, fragments };
};

const sanitize = (html: string): string => {
  const documentNode = new DOMParser().parseFromString(html, "text/html");
  documentNode.querySelectorAll("script, iframe, object, embed").forEach((node) => node.remove());
  documentNode.querySelectorAll("*").forEach((node) => {
    for (const attribute of Array.from(node.attributes)) {
      if (attribute.name.startsWith("on")) node.removeAttribute(attribute.name);
      if ((attribute.name === "href" || attribute.name === "src") && /^\s*javascript:/iu.test(attribute.value)) {
        node.removeAttribute(attribute.name);
      }
    }
  });
  return documentNode.body.innerHTML;
};

const buildExportElement = async (content: string, title: string): Promise<HTMLElement> => {
  const { source, fragments } = await renderMath(content);
  let html = marked.parse(source, { gfm: true, breaks: false }) as string;
  fragments.forEach((fragment, token) => {
    html = html.split(token).join(fragment);
  });

  const root = document.createElement("article");
  root.className = "repsel-pdf";
  root.id = "repsel-pdf-export";
  root.innerHTML = sanitize(html);
  root.dataset.title = title;
  root.querySelectorAll('li > input[type="checkbox"]').forEach((checkbox) => {
    checkbox.parentElement?.classList.add("task-list-item");
  });
  const stage = document.createElement("div");
  stage.className = "repsel-export-stage";
  stage.appendChild(root);
  document.body.appendChild(stage);
  return root;
};

const waitForExportAssets = async (element: HTMLElement): Promise<void> => {
  await document.fonts.ready;
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(async (image) => {
      if (image.complete) return;
      await new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
};

const waitForPaint = async (): Promise<void> => {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
};

export const createPdf = async (content: string, title: string): Promise<Uint8Array> => {
  const module = await import("html2pdf.js");
  const htmlToPdf = module.default as unknown as HtmlToPdfFactory;
  const element = await buildExportElement(content, title);

  try {
    await waitForExportAssets(element);
    await waitForPaint();
    const buffer = await htmlToPdf()
      .set({
        margin: [18, 18, 20, 18],
        filename: title.replace(/\.md$/iu, ".pdf"),
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
          windowHeight: Math.max(1123, element.scrollHeight),
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["css", "legacy"],
          avoid: ["pre", "blockquote", "table", ".repsel-math-display"],
        },
      })
      .from(element)
      .toCanvas()
      .toPdf()
      .output("arraybuffer");

    const bytes = new Uint8Array(buffer);
    if (bytes.byteLength < 5_000) {
      throw new Error(
        "Le moteur PDF n'a pas capturé le document. Aucun fichier vide n'a été enregistré.",
      );
    }

    return bytes;
  } finally {
    element.closest(".repsel-export-stage")?.remove();
  }
};
