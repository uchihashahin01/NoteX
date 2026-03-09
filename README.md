<div align="center">

# ✨ NoteX

### A Modern, Lightweight Note-Taking App for Developers

Built with **Tauri + React + TypeScript** for blazing-fast performance with minimal RAM usage.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-v2-orange)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)

</div>

---

## 🚀 What is NoteX?

NoteX is a **Notion-like** desktop note-taking application designed specifically for developers who work with Linux commands, code snippets, and technical documentation. It saves all notes as standard **Markdown (.md)** files, making them portable and version-control friendly.

### Why NoteX?

| Feature | NoteX | Electron Apps | Web Apps |
|---------|-------|---------------|----------|
| RAM Usage | ~30-50 MB | 150-300 MB | Browser dependent |
| Binary Size | ~4 MB (.deb) | 100+ MB | N/A |
| Native Feel | ✅ | Partial | ❌ |
| Offline | ✅ | ✅ | ❌ |
| System Tray | ✅ | Plugin needed | ❌ |

---

## 📦 Installation

### From .deb (Debian/Ubuntu/Mint)

```bash
sudo dpkg -i NoteX_0.1.0_amd64.deb
```

### From .rpm (Fedora/RHEL)

```bash
sudo rpm -i NoteX-0.1.0-1.x86_64.rpm
```

### From AppImage (Any Linux)

```bash
chmod +x NoteX_0.1.0_amd64.AppImage
./NoteX_0.1.0_amd64.AppImage
```

### Build from Source

**Prerequisites:**
- Node.js 18+
- Rust 1.77+
- System libraries (see below)

```bash
# Install system dependencies (Debian/Ubuntu)
sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential \
  libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Clone and build
git clone https://github.com/uchiha/note-taking.git
cd note-taking
npm install
npm run tauri:build
```

The built packages will be in `src-tauri/target/release/bundle/`.

---

## 🖥️ Usage

### Getting Started

1. **Launch NoteX** — the app opens with a welcome screen
2. **Create a note** — click the `+` button in the sidebar or use the welcome screen button
3. **Start writing** — use the rich toolbar or Markdown shortcuts
4. **Organize** — create folders, drag notes, build your knowledge base

### Notes Storage

All notes are stored as `.md` files in:
```
~/NoteX/
├── My First Note.md
├── Linux Commands/
│   ├── Network.md
│   └── System.md
└── Projects/
    └── Ideas.md
```

### System Tray

- **Closing the window** minimizes NoteX to the system tray (it keeps running in the background)
- **Double-click** the tray icon to restore the window
- **Right-click** the tray icon to access:
  - **Show NoteX** — restore the window
  - **Quit NoteX** — fully exit the application

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save current note |
| `Ctrl+B` | Bold text |
| `Ctrl+I` | Italic text |
| `Ctrl+U` | Underline text |
| `Ctrl+E` | Inline code |
| `Ctrl+Shift+C` | Code block |
| `Ctrl+Shift+X` | Strikethrough |

### Code Blocks

NoteX supports syntax highlighting for **40+ languages** including:

Python, JavaScript, TypeScript, Rust, Go, Java, C++, C#, PHP, Ruby, Swift, Kotlin, SQL, Bash, Shell, YAML, JSON, XML/HTML, CSS, SCSS, Dockerfile, Nginx, Lua, Perl, R, Scala, Haskell, Elixir, Erlang, Clojure, PowerShell, Vim, Diff, INI, Makefile, and more.

Every code block has a **copy button** that appears on hover — one click to copy the entire block.

### Screenshots & Images

- **Paste** screenshots directly from clipboard (`Ctrl+V`)
- **Drag & drop** image files into the editor
- **Insert** via the toolbar image button
- Images are saved locally in a `.assets` folder

---

## 🏗️ Tech Stack

- **Backend**: [Tauri v2](https://tauri.app) (Rust) — native performance, tiny footprint
- **Frontend**: [React 19](https://react.dev) + TypeScript + [Vite](https://vite.dev)
- **Editor**: [TipTap v3](https://tiptap.dev) — Notion-like block editor
- **Code Highlighting**: [highlight.js](https://highlightjs.org) via lowlight
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + CSS custom properties
- **State**: [Zustand](https://zustand-demo.pmnd.rs)
- **Icons**: [Lucide](https://lucide.dev)

---

## 📂 Project Structure

```
note-taking/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── Editor.tsx      # TipTap rich text editor
│   │   ├── Sidebar.tsx     # File tree sidebar
│   │   ├── TopBar.tsx      # Top navigation bar
│   │   ├── CodeBlockWrapper.tsx  # Code copy buttons
│   │   ├── ContextMenu.tsx # Right-click menu
│   │   ├── Modal.tsx       # Create/rename dialogs
│   │   └── WelcomeScreen.tsx
│   ├── store/              # Zustand state management
│   ├── styles/             # CSS styles
│   └── utils/              # Markdown conversion
├── src-tauri/              # Rust backend
│   ├── src/lib.rs          # Tauri commands & system tray
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── package.json
└── vite.config.ts
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
