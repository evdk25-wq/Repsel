import React, { useEffect, useRef, useState } from "react";
import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { repselPlugin } from "../editor/RepselPlugin";
import repselLogo from "../../assets/RepselLogoUI.png";
import { buildOutline, insertCommands, type InsertCommand, type OutlineItem } from "../../domain/markdown";

interface EditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ initialContent, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const applyingExternalContentRef = useRef(false);
  const [outline, setOutline] = useState<OutlineItem[]>(() => buildOutline(initialContent));
  const [isEmpty, setIsEmpty] = useState(() => initialContent.trim().length === 0);
  const [railMode, setRailMode] = useState<"outline" | "blocks" | null>(null);
  const [activeHeadingPosition, setActiveHeadingPosition] = useState<number | null>(
    () => buildOutline(initialContent)[0]?.position ?? null,
  );
  const [slashMenu, setSlashMenu] = useState<{ from: number; to: number; query: string; left: number; top: number } | null>(null);
  const [selectionMenu, setSelectionMenu] = useState<{ left: number; top: number } | null>(null);

  const wrapSelection = (before: string, after = before, placeholder = "texte") => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch(
      view.state.changeByRange((range) => {
        const selected = view.state.sliceDoc(range.from, range.to);
        const content = selected || placeholder;
        const insert = `${before}${content}${after}`;
        return {
          changes: { from: range.from, to: range.to, insert },
          range: EditorSelection.range(
            range.from + before.length,
            range.from + before.length + content.length,
          ),
        };
      }),
    );
    view.focus();
  };

  const prefixLine = (prefix: string) => {
    const view = viewRef.current;
    if (!view) return;
    const line = view.state.doc.lineAt(view.state.selection.main.head);
    const existingPrefix = view.state.sliceDoc(line.from, Math.min(line.from + prefix.length, line.to));
    const shouldRemove = existingPrefix === prefix;
    view.dispatch({
      changes: shouldRemove
        ? { from: line.from, to: line.from + prefix.length, insert: "" }
        : { from: line.from, insert: prefix },
      selection: {
        anchor: Math.max(
          line.from,
          view.state.selection.main.head + (shouldRemove ? -prefix.length : prefix.length),
        ),
      },
    });
    view.focus();
  };

  const insertTemplate = (command: InsertCommand, replaceFrom?: number, replaceTo?: number) => {
    const view = viewRef.current;
    if (!view) return;
    const selection = view.state.selection.main;
    const from = replaceFrom ?? selection.from;
    const to = replaceTo ?? selection.to;
    view.dispatch({
      changes: { from, to, insert: command.template },
      selection: {
        anchor: from + (command.selectionStart ?? command.template.length),
        head: from + (command.selectionStart ?? command.template.length) + (command.selectionLength ?? 0),
      },
    });
    setSlashMenu(null);
    view.focus();
  };

  const goToHeading = (position: number) => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ selection: { anchor: position }, scrollIntoView: true });
    view.focus();
  };

  const updateContextualUi = (view: EditorView) => {
    const selection = view.state.selection.main;
    const currentOutline = buildOutline(view.state.doc.toString());
    const precedingHeadings = currentOutline.filter((item) => item.position <= selection.head);
    const activeHeading = precedingHeadings[precedingHeadings.length - 1];
    setActiveHeadingPosition(activeHeading?.position ?? null);

    if (!selection.empty) {
      const start = view.coordsAtPos(selection.from);
      const end = view.coordsAtPos(selection.to);
      if (start && end) {
        setSelectionMenu({ left: (start.left + end.right) / 2, top: Math.min(start.top, end.top) - 10 });
      }
      setSlashMenu(null);
      return;
    }

    setSelectionMenu(null);
    const line = view.state.doc.lineAt(selection.head);
    const beforeCursor = view.state.sliceDoc(line.from, selection.head);
    const match = /(?:^|\s)\/([\p{L}-]*)$/u.exec(beforeCursor);
    if (!match) {
      setSlashMenu(null);
      return;
    }
    const coords = view.coordsAtPos(selection.head);
    if (coords) {
      const from = selection.head - match[0].trimStart().length;
      setSlashMenu({ from, to: selection.head, query: match[1].toLowerCase(), left: coords.left, top: coords.bottom + 8 });
    }
  };

  const editorKeymap = [
    { key: "Mod-b", run: () => { wrapSelection("**"); return true; } },
    { key: "Mod-i", run: () => { wrapSelection("*"); return true; } },
    { key: "Mod-k", run: () => { wrapSelection("[", "](https://)", "libellé"); return true; } },
    { key: "Mod-p", run: () => { setRailMode("blocks"); return true; } },
    { key: "Mod-/", run: () => { setRailMode("blocks"); return true; } },
  ];

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: initialContent,
      extensions: [
        history(),
        keymap.of([...editorKeymap, ...defaultKeymap, ...historyKeymap]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        repselPlugin,
        EditorView.lineWrapping,
        EditorView.domEventHandlers({
          keydown: (event, view) => {
            if (event.key === "Escape") {
              setSlashMenu(null);
              setSelectionMenu(null);
              return false;
            }
            if (event.key !== "Enter" || !view.state.selection.main.empty) return false;

            const head = view.state.selection.main.head;
            const line = view.state.doc.lineAt(head);
            const beforeCursor = view.state.sliceDoc(line.from, head);
            const match = /(?:^|\s)\/([\p{L}-]*)$/u.exec(beforeCursor);
            if (!match) return false;

            const query = match[1].toLowerCase();
            const command = insertCommands.find((item) =>
              `${item.id} ${item.label}`.toLowerCase().includes(query),
            );
            if (!command) return false;

            event.preventDefault();
            const from = head - match[0].trimStart().length;
            view.dispatch({
              changes: { from, to: head, insert: command.template },
              selection: {
                anchor: from + (command.selectionStart ?? command.template.length),
                head: from + (command.selectionStart ?? command.template.length) + (command.selectionLength ?? 0),
              },
            });
            setSlashMenu(null);
            return true;
          },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !applyingExternalContentRef.current) {
            const content = update.state.doc.toString();
            onChange(content);
            setOutline(buildOutline(content));
            setIsEmpty(content.trim().length === 0);
          }
          if (update.docChanged || update.selectionSet || update.viewportChanged) updateContextualUi(update.view);
        }),
        EditorView.theme({
          "&": { height: "100%", fontSize: "17px", backgroundColor: "transparent" },
          ".cm-scroller": { overflow: "auto", lineHeight: "1.72" },
          ".cm-content": { fontFamily: "var(--font-editor)", padding: "52px 72px 120px", maxWidth: "840px", margin: "0 auto", caretColor: "var(--accent)" },
          ".cm-line": { padding: "1px 0" },
          ".cm-selectionBackground": { backgroundColor: "var(--selection) !important" },
          ".cm-cursor": { borderLeftColor: "var(--accent)", borderLeftWidth: "2px" },
          "&.cm-focused": { outline: "none" }
        })
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []); // Run only on mount

  useEffect(() => {
    if (viewRef.current) {
      const view = viewRef.current;
      const currentDoc = view.state.doc.toString();
      if (currentDoc !== initialContent) {
        applyingExternalContentRef.current = true;
        view.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: initialContent }
        });
        applyingExternalContentRef.current = false;
        setOutline(buildOutline(initialContent));
        setIsEmpty(initialContent.trim().length === 0);
      }
    }
  }, [initialContent]);

  const keepEditorFocus = (event: React.MouseEvent) => event.preventDefault();
  const filteredCommands = insertCommands.filter((command) =>
    `${command.id} ${command.label}`.toLowerCase().includes(slashMenu?.query ?? ""),
  );

  return (
    <div className={`editor-workspace ${railMode ? "has-drawer" : ""}`}>
      <aside className="document-rail" aria-label="Outils du document">
        <button className={`rail-tool ${railMode === "outline" ? "is-active" : ""}`} onClick={() => setRailMode(railMode === "outline" ? null : "outline")} title="Plan du document">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 5h2M9 5h7M4 10h2M9 10h7M4 15h2M9 15h7" /></svg>
        </button>
        <button className={`rail-tool ${railMode === "blocks" ? "is-active" : ""}`} onClick={() => setRailMode(railMode === "blocks" ? null : "blocks")} title="Insérer un bloc">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v14M3 10h14" /></svg>
        </button>

        {railMode && (
          <section className="rail-drawer">
            <header>
              <div>
                <span className="rail-eyebrow">Document</span>
                <h2>{railMode === "outline" ? "Plan" : "Insérer"}</h2>
              </div>
              <button onClick={() => setRailMode(null)} className="drawer-close" aria-label="Fermer">×</button>
            </header>
            {railMode === "outline" ? (
              <div className="outline-list">
                {outline.length ? outline.map((item, index) => (
                  <button
                    key={`${item.position}-${index}`}
                    className={activeHeadingPosition === item.position ? "is-active" : ""}
                    onClick={() => goToHeading(item.position)}
                    style={{ paddingLeft: `${12 + (item.level - 1) * 12}px` }}
                  >
                    <span>{item.label}</span>
                  </button>
                )) : <p className="drawer-empty">Ajoutez un titre pour construire le plan du document.</p>}
              </div>
            ) : (
              <div className="block-list">
                {insertCommands.map((command) => (
                  <button key={command.id} onClick={() => insertTemplate(command)}>
                    <span className="block-symbol">{command.hint}</span>
                    <span><strong>{command.label}</strong><small>/{command.id}</small></span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </aside>

      <div className="paper-frame">
        <div ref={editorRef} className="repsel-editor" />
        {isEmpty && (
          <section className="editor-welcome" onClick={() => viewRef.current?.focus()}>
            <div className="welcome-mark">
              <img src={repselLogo} alt="" />
            </div>
            <p className="welcome-eyebrow">Éditeur Markdown</p>
            <h1>Bienvenue dans Repsel</h1>
            <p className="welcome-copy">Un espace calme pour structurer vos idées et écrire sans distraction.</p>
            <div className="welcome-shortcuts">
              <div><kbd>Ctrl O</kbd><span>Ouvrir un document</span></div>
              <div><kbd>Ctrl S</kbd><span>Enregistrer</span></div>
              <div><kbd>/</kbd><span>Insérer un bloc</span></div>
            </div>
            <button onClick={() => viewRef.current?.focus()}>Commencer à écrire</button>
          </section>
        )}
        <aside className="format-toolbar" aria-label="Mise en forme rapide">
        <button onMouseDown={keepEditorFocus} onClick={() => prefixLine("# ")} className="format-tool" title="Titre principal">
          <span className="format-heading">H1</span>
        </button>
        <div className="format-divider" />
        <button onMouseDown={keepEditorFocus} onClick={() => wrapSelection("**")} className="format-tool format-bold" title="Gras">
          B
        </button>
        <button onMouseDown={keepEditorFocus} onClick={() => wrapSelection("*")} className="format-tool format-italic" title="Italique">
          I
        </button>
        <button onMouseDown={keepEditorFocus} onClick={() => wrapSelection("[", "](https://)", "libellé")} className="format-tool" title="Lien">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m8.1 11.9 3.8-3.8M6.5 13.5l-1 1a2.83 2.83 0 0 1-4-4l2.25-2.25a2.83 2.83 0 0 1 4 0M13.5 6.5l1-1a2.83 2.83 0 1 1 4 4l-2.25 2.25a2.83 2.83 0 0 1-4 0" />
          </svg>
        </button>
        <button onMouseDown={keepEditorFocus} onClick={() => wrapSelection("`")} className="format-tool" title="Code en ligne">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m7.5 5-5 5 5 5M12.5 5l5 5-5 5" />
          </svg>
        </button>
        <button onMouseDown={keepEditorFocus} onClick={() => wrapSelection("$", "$", "E=mc^2")} className="format-tool format-math" title="Formule">
          ∑
        </button>
        </aside>
      </div>

      {slashMenu && (
        <div className="slash-palette" style={{ left: slashMenu.left, top: slashMenu.top }}>
          <div className="slash-palette-header">
            <span>Insérer un bloc</span>
            <kbd>/</kbd>
          </div>
          <div className="slash-results">
            {filteredCommands.length ? filteredCommands.map((command) => (
              <button
                key={command.id}
                onMouseDown={keepEditorFocus}
                onClick={() => insertTemplate(command, slashMenu.from, slashMenu.to)}
              >
                <span className="block-symbol">{command.hint}</span>
                <span><strong>{command.label}</strong><small>{command.id}</small></span>
              </button>
            )) : <p>Aucune commande correspondante</p>}
          </div>
        </div>
      )}

      {selectionMenu && (
        <div className="selection-toolbar" style={{ left: selectionMenu.left, top: selectionMenu.top }}>
          <button onMouseDown={keepEditorFocus} onClick={() => wrapSelection("**")} className="format-bold" title="Gras">B</button>
          <button onMouseDown={keepEditorFocus} onClick={() => wrapSelection("*")} className="format-italic" title="Italique">I</button>
          <button onMouseDown={keepEditorFocus} onClick={() => wrapSelection("[", "](https://)")} title="Lien">Lien</button>
          <button onMouseDown={keepEditorFocus} onClick={() => wrapSelection("`")} title="Code">Code</button>
        </div>
      )}
    </div>
  );
};

export default Editor;
