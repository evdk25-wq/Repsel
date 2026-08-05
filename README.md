<div align="center">
  <p><img src="1.png" alt="Repsel application preview" style="max-width:100%;height:auto"></p>

  # Repsel

  **English** · [Français](docs/README.fr.md)

  **A focused desktop Markdown editor built for Linux.**

  Fluid writing, mathematical notation, and polished PDF export in a local
  application powered by Tauri and WebKitGTK.
</div>

## Download Repsel 1.0.1

Repsel is available for 64-bit Linux systems.

| Format | Recommended for | Download |
| --- | --- | --- |
| Debian `.deb` | Debian, Ubuntu, and derivatives | [Repsel 1.0.1 AMD64](https://github.com/evdk25-wq/Repsel/releases/download/v1.0.1/Repsel_1.0.1_amd64.deb) |
| AppImage | Portable use without installation | [Repsel 1.0.1 AMD64](https://github.com/evdk25-wq/Repsel/releases/download/v1.0.1/Repsel_1.0.1_amd64.AppImage) |

All versions and release notes are available from
[GitHub Releases](https://github.com/evdk25-wq/Repsel/releases).

### Install the Debian package

```bash
sudo apt install ./Repsel_1.0.1_amd64.deb
```

### Run the AppImage

```bash
chmod +x Repsel_1.0.1_amd64.AppImage
./Repsel_1.0.1_amd64.AppImage
```

## About

Repsel is a Markdown editor designed to keep attention on the document. Its
interface fits naturally into a Linux desktop and combines the simplicity of a
plain-text file with immediate visual feedback.

Documents remain standard Markdown files. Repsel requires no account and no
online service to open, edit, or save a document.

## Features

- Markdown editing powered by CodeMirror 6;
- visual syntax hiding outside the active line;
- headings, lists, blockquotes, tasks, tables, links, and code blocks;
- inline and display mathematical notation;
- insertion palette and quick commands;
- contextual formatting toolbar;
- open, save, and Save As commands;
- protection against unsaved changes;
- A4 PDF export with pagination and WebKitGTK-compatible mathematical rendering;
- persistent light and dark themes;
- interface available in English and French;
- word and character counters;
- custom window chrome designed for the Linux desktop.

## Mathematical notation

Repsel uses standard TeX syntax:

```markdown
An inline formula: $E = mc^2$

A centered formula:

$$
f(x) = \frac{1}{\sigma\sqrt{2\pi}}
\exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)
$$
```

KaTeX renders formulas inside the editor. For PDF export, MathJax 4 produces
intermediate SVG output to preserve fractions, roots, and matrices under
WebKitGTK.

## Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| New document | `Ctrl+N` |
| Open | `Ctrl+O` |
| Save | `Ctrl+S` |
| Save As | `Ctrl+Shift+S` |
| Bold | `Ctrl+B` |
| Italic | `Ctrl+I` |
| Insert link | `Ctrl+K` |
| Insertion palette | `Ctrl+P` |
| Markdown help | `Ctrl+/` |

## Why Tauri and WebKitGTK?

Repsel uses Tauri 2 instead of embedding a Chromium browser. On Linux, its
interface runs on WebKitGTK, keeping the application compact, resource usage
under control, and system integration consistent with the desktop.

## Development setup

### Requirements

- Node.js 20 or later;
- npm;
- stable Rust;
- the system dependencies required by Tauri 2.

On Debian or Ubuntu:

```bash
sudo apt update
sudo apt install \
  build-essential \
  curl \
  file \
  libappindicator3-dev \
  libgtk-3-dev \
  librsvg2-dev \
  libssl-dev \
  libwebkit2gtk-4.1-dev \
  patchelf
```

Install Rust if needed:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Run Repsel

```bash
cd path/to/Repsel
npm install
npm run tauri dev
```

The Vite development server uses port `1420`.

## Build the application

```bash
npm run tauri build
```

Generated packages are written to:

```text
src-tauri/target/release/bundle/
```

## Quality checks

```bash
npm test
npm run build
cd src-tauri
cargo test
```

The test suite covers the document domain, Markdown analysis, the main user
interface, and SVG rendering for mathematical notation.

## Architecture

The codebase separates domain rules, application use cases, system access, and
the user interface:

```text
src/
├── domain/                 Document model and Markdown analysis
├── application/
│   └── pdf/                PDF generation and mathematical rendering
├── infrastructure/
│   └── tauri/              Dialogs and file-system access
└── ui/
    ├── components/         React components
    ├── editor/             CodeMirror extension
    └── styles/             Themes and layout

src-tauri/                  Native Rust application and Tauri configuration
```

This structure follows Clean Architecture principles: the domain does not
depend on React or Tauri, while system-specific details remain isolated in the
infrastructure layer.

## Technology

- React 19 and TypeScript;
- CodeMirror 6 and Lezer Markdown;
- Tailwind CSS 4;
- KaTeX and MathJax 4;
- Tauri 2 and Rust;
- WebKitGTK on Linux;
- Vitest and Testing Library.

## Documentation

The user guide is available in French in
[`DOCUMENTATION.md`](DOCUMENTATION.md).

## Contributing

Bug reports and feature suggestions are welcome in the repository issues. To
propose a code change:

1. create a dedicated branch;
2. add or update the relevant tests;
3. run the project checks;
4. open a pull request with a concise description of the change.

## License

Repsel is distributed under the MIT License. See [`LICENSE`](LICENSE) for the
full terms.
