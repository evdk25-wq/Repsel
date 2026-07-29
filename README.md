# Repsel

Repsel est un éditeur Markdown de bureau conçu pour Linux. Il associe une
interface sobre inspirée de GNOME, un aperçu Markdown directement dans
l’éditeur et le rendu des formules mathématiques avec KaTeX.

## Fonctionnalités

- aperçu Markdown intégré à CodeMirror ;
- formules KaTeX en ligne (`$…$`) et en bloc (`$$…$$`) ;
- ouverture et sauvegarde de fichiers Markdown ;
- export en PDF ;
- thème clair ou sombre ;
- protection contre la fermeture ou l’effacement d’un document modifié ;
- compteurs de mots et de caractères.

## Développement

Prérequis : Node.js 20+, Rust et les dépendances système de Tauri 2.

```bash
npm install
npm run tauri dev
```

Vérifications :

```bash
npm test
npm run build
cd src-tauri && cargo test
```

Consultez [DOCUMENTATION.md](DOCUMENTATION.md) pour le manuel d’utilisation.
