import { marked } from "marked";

const renderMath = async (
  markdown: string,
): Promise<{ source: string; fragments: Map<string, string> }> => {
  if (!markdown.includes("$")) {
    return { source: markdown, fragments: new Map() };
  }

  const { renderMathSvg } = await import("../pdf/mathSvg");
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

const hasSafeUrl = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return !normalized
    || /^(?:https?:|mailto:|#|\/)/u.test(normalized)
    || /^data:image\/(?:png|jpeg|gif|webp);base64,/u.test(normalized);
};

const sanitize = (html: string): string => {
  const documentNode = new DOMParser().parseFromString(html, "text/html");
  documentNode
    .querySelectorAll("script, iframe, object, embed, style, link, meta, base, form, button, textarea, select")
    .forEach((node) => node.remove());

  documentNode.querySelectorAll("*").forEach((node) => {
    for (const attribute of Array.from(node.attributes)) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || name === "style" || name === "srcdoc") {
        node.removeAttribute(attribute.name);
        continue;
      }
      if ((name === "href" || name === "src") && !hasSafeUrl(attribute.value)) {
        node.removeAttribute(attribute.name);
      }
    }

    if (node instanceof HTMLInputElement) {
      const isTask = node.type === "checkbox";
      if (!isTask) {
        node.remove();
      } else {
        node.disabled = true;
      }
    }

    if (node instanceof HTMLAnchorElement) {
      node.rel = "noopener noreferrer";
      node.target = "_blank";
    }
  });

  return documentNode.body.innerHTML;
};

export const renderMarkdownHtml = async (content: string): Promise<string> => {
  const { source, fragments } = await renderMath(content);
  let html = sanitize(marked.parse(source, { gfm: true, breaks: false }) as string);
  fragments.forEach((fragment, token) => {
    html = html.split(token).join(fragment);
  });
  return html;
};
