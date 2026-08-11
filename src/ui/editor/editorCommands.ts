export type EditorCommand =
  | "undo"
  | "redo"
  | "cut"
  | "copy"
  | "paste"
  | "copyHtml"
  | "selectAll"
  | "deselect"
  | "insertImage"
  | "find"
  | "replace"
  | "findNext"
  | "findPrevious"
  | "toggleSpellcheck";

export const runEditorCommand = (command: EditorCommand) => {
  window.dispatchEvent(new CustomEvent<EditorCommand>("repsel-editor-command", { detail: command }));
};
