import { renderMarkdownHtml } from "../markdown/renderHtml";

interface HtmlToPdfWorker {
  set(options: object): HtmlToPdfWorker;
  from(element: HTMLElement): HtmlToPdfWorker;
  toCanvas(): HtmlToPdfWorker;
  toPdf(): HtmlToPdfWorker;
  output(type: "arraybuffer"): Promise<ArrayBuffer>;
}

type HtmlToPdfFactory = () => HtmlToPdfWorker;

export const markPageBreakRelationships = (root: HTMLElement): void => {
  root.querySelectorAll("p").forEach((paragraph) => {
    const next = paragraph.nextElementSibling;
    if (next?.matches("ul, ol, table, pre, blockquote, .repsel-math-display")) {
      const group = document.createElement("div");
      group.className = "pdf-keep-together";
      paragraph.parentElement?.insertBefore(group, paragraph);
      group.append(paragraph, next);
    }
  });

  root.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
    const next = heading.nextElementSibling;
    if (!next) return;
    const group = document.createElement("div");
    group.className = "pdf-keep-together";
    heading.parentElement?.insertBefore(group, heading);
    group.append(heading, next);
  });
};

const buildExportElement = async (content: string, title: string): Promise<HTMLElement> => {
  const root = document.createElement("article");
  root.className = "repsel-pdf";
  root.id = "repsel-pdf-export";
  root.innerHTML = await renderMarkdownHtml(content);
  root.dataset.title = title;
  root.querySelectorAll('li > input[type="checkbox"]').forEach((checkbox) => {
    checkbox.parentElement?.classList.add("task-list-item");
  });
  markPageBreakRelationships(root);
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
        image: { type: "jpeg", quality: 0.94 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
          windowHeight: 1123,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
          avoid: ["p", "li", "pre", "blockquote", "table", "tr", ".repsel-math-display", ".pdf-keep-together"],
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
