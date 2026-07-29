import { ViewPlugin, Decoration, DecorationSet, EditorView, WidgetType, ViewUpdate } from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import katex from "katex";

class MathWidget extends WidgetType {
  constructor(readonly math: string, readonly block: boolean) {
    super();
  }

  eq(other: MathWidget) {
    return this.math === other.math && this.block === other.block;
  }

  toDOM() {
    const el = document.createElement("span");
    el.className = "cm-math-widget" + (this.block ? " block w-full text-center my-4" : " inline-block");
    try {
      katex.render(this.math, el, {
        displayMode: this.block,
        throwOnError: false,
      });
    } catch (e) {
      el.textContent = this.math;
      el.className += " text-red-500";
    }
    return el;
  }

  ignoreEvent() {
    return false;
  }
}

const hiddenMark = Decoration.replace({});
const inlineHiddenTextMark = Decoration.mark({ class: "opacity-0 text-[1px] leading-[1px] text-transparent select-none inline-block w-0" });

const buildUnifiedDecorations = (view: EditorView) => {
  const widgets: any[] = [];
  const decoratedLines = new Set<number>();
  const text = view.state.doc.toString();
  const selection = view.state.selection.main;
  const activeLine = view.state.doc.lineAt(selection.head);

  const replacedRanges: { from: number; to: number }[] = [];

  const addMath = (from: number, to: number, mathContent: string, isBlock: boolean) => {
    const isCursorInside = selection.head >= from && selection.head <= to;
    if (!isCursorInside) {
      if (isBlock) {
        widgets.push(Decoration.widget({ 
          widget: new MathWidget(mathContent, true)
        }).range(from));
        
        let currentLine = view.state.doc.lineAt(from);
        const endLine = view.state.doc.lineAt(to);
        
        while (currentLine.number <= endLine.number) {
          const start = Math.max(from, currentLine.from);
          const end = Math.min(to, currentLine.to);
          if (start < end) {
            widgets.push(inlineHiddenTextMark.range(start, end));
          }
          if (currentLine.number === endLine.number) break;
          currentLine = view.state.doc.line(currentLine.number + 1);
        }
        
        replacedRanges.push({ from, to });
      } else {
        widgets.push(Decoration.replace({ 
          widget: new MathWidget(mathContent, false)
        }).range(from, to));
        replacedRanges.push({ from, to });
      }
    }
  };

  const blockRegex = /\$\$([\s\S]+?)\$\$/g;
  let match;
  while ((match = blockRegex.exec(text)) !== null) {
    addMath(match.index, match.index + match[0].length, match[1], true);
  }

  const inlineRegex = /\$([^$\n]+)\$/g;
  while ((match = inlineRegex.exec(text)) !== null) {
    const isInsideBlock = replacedRanges.some(r => match!.index >= r.from && match!.index <= r.to);
    if (!isInsideBlock) {
      addMath(match.index, match.index + match[0].length, match[1], false);
    }
  }

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        const nodeLineStart = view.state.doc.lineAt(node.from);
        const nodeLineEnd = view.state.doc.lineAt(node.to);
        const isActive = activeLine.number >= nodeLineStart.number && activeLine.number <= nodeLineEnd.number;
        const name = node.name;

        const addLineStyle = (className: string) => {
          const line = view.state.doc.lineAt(node.from);
          if (!decoratedLines.has(line.from)) {
            widgets.push(Decoration.line({ class: className }).range(line.from));
            decoratedLines.add(line.from);
          }
        };

        if (name === "ATXHeading1" || name === "SetextHeading1") addLineStyle("repsel-heading repsel-heading-1");
        if (name === "ATXHeading2" || name === "SetextHeading2") addLineStyle("repsel-heading repsel-heading-2");
        if (/^ATXHeading[3-6]$/.test(name)) addLineStyle("repsel-heading repsel-heading-3");
        if (name === "Blockquote") addLineStyle("repsel-quote");
        if (name === "StrongEmphasis") widgets.push(Decoration.mark({ class: "repsel-strong" }).range(node.from, node.to));
        if (name === "Emphasis") widgets.push(Decoration.mark({ class: "repsel-emphasis" }).range(node.from, node.to));
        if (name === "InlineCode") widgets.push(Decoration.mark({ class: "repsel-inline-code" }).range(node.from, node.to));
        if (name === "Link") widgets.push(Decoration.mark({ class: "repsel-link" }).range(node.from, node.to));
        
        if (!isActive) {
          if (
            name === "HeaderMark" ||
            name === "EmphasisMark" ||
            name === "StrongMark" ||
            name === "StrikethroughMark" ||
            name === "ListMark" ||
            name === "QuoteMark" ||
            name === "LinkMark"
          ) {
            const isOverlapping = replacedRanges.some(r => Math.max(node.from, r.from) < Math.min(node.to, r.to));
            if (!isOverlapping) {
              widgets.push(hiddenMark.range(node.from, node.to));
            }
          }
        }
      },
    });
  }

  try {
    return Decoration.set(widgets, true);
  } catch (e) {
    console.error("Decoration Error:", e);
    return Decoration.none;
  }
};

export const repselPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildUnifiedDecorations(view);
    }
    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = buildUnifiedDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);
