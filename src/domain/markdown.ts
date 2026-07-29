export interface OutlineItem {
  level: number;
  label: string;
  position: number;
}

export interface InsertCommand {
  id: string;
  label: string;
  hint: string;
  template: string;
  selectionStart?: number;
  selectionLength?: number;
}

export const insertCommands: InsertCommand[] = [
  { id: "titre", label: "Titre principal", hint: "#", template: "# Titre", selectionStart: 2, selectionLength: 5 },
  { id: "section", label: "Nouvelle section", hint: "##", template: "## Section", selectionStart: 3, selectionLength: 7 },
  { id: "citation", label: "Citation", hint: ">", template: "> Citation", selectionStart: 2, selectionLength: 8 },
  { id: "liste", label: "Liste à puces", hint: "—", template: "- Élément", selectionStart: 2, selectionLength: 7 },
  { id: "tache", label: "Liste de tâches", hint: "□", template: "- [ ] Tâche", selectionStart: 6, selectionLength: 5 },
  { id: "code", label: "Bloc de code", hint: "</>", template: "```text\nCode\n```", selectionStart: 8, selectionLength: 4 },
  { id: "formule", label: "Formule mathématique", hint: "∑", template: "$$E=mc^2$$", selectionStart: 2, selectionLength: 6 },
  { id: "tableau", label: "Tableau", hint: "▦", template: "| Colonne | Valeur |\n| --- | --- |\n| Texte | Texte |", selectionStart: 2, selectionLength: 7 },
];

export const buildOutline = (content: string): OutlineItem[] => {
  const items: OutlineItem[] = [];
  let position = 0;
  content.split("\n").forEach((line) => {
    const match = /^(#{1,6})\s+(.+)$/u.exec(line);
    if (match) items.push({ level: match[1].length, label: match[2], position });
    position += line.length + 1;
  });
  return items;
};
