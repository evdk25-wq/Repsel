# Manuel d’utilisation de Repsel

Repsel est un éditeur Markdown de bureau pour Linux, centré sur la lisibilité
et la concentration.

## Écrire avec l’aperçu intégré

Saisissez normalement votre syntaxe Markdown, par exemple `**gras**` ou
`# Titre`. Lorsque le curseur quitte la ligne, les marqueurs de mise en forme
s’effacent visuellement. Cliquez de nouveau sur la ligne pour les modifier.

Les formules KaTeX utilisent `$E=mc^2$` en ligne et `$$…$$` pour un bloc.

## Fichiers

Le menu **Fichier** permet d’ouvrir, d’enregistrer et d’exporter un document
au format PDF. Repsel avertit avant d’abandonner des modifications non
enregistrées. Un point devant le titre indique que le document a changé.

| Action | Raccourci |
| --- | --- |
| Ouvrir | `Ctrl+O` |
| Enregistrer | `Ctrl+S` |

Le menu **Édition > Nouveau** crée un document vide. Le menu **Réglages**
permet de basculer entre les thèmes clair et sombre.

## Développement

Repsel utilise React 19, TypeScript, Tailwind CSS 4 et CodeMirror 6 côté
interface, ainsi que Rust et Tauri 2 côté bureau.

Lancement :

```bash
npm run tauri dev
```
