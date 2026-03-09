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

### Quick Install (Recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/uchihashahin01/NoteX/main/install.sh | bash
```

This automatically downloads the latest release and installs it. After install:
- Run the app: `notex`
- Update later: `notex-update`

### From .deb (Debian/Ubuntu/Mint)

Download the latest `.deb` from [Releases](https://github.com/uchihashahin01/NoteX/releases/latest):

```bash
sudo dpkg -i NoteX_*.deb
```

### From .rpm (Fedora/RHEL)

```bash
sudo rpm -i NoteX-*.rpm
```

### From AppImage (Any Linux)

```bash
chmod +x NoteX_*.AppImage
./NoteX_*.AppImage
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
git clone https://github.com/uchihashahin01/NoteX.git
cd NoteX
npm install
npm run tauri:build
```

The built packages will be in `src-tauri/target/release/bundle/`.

---

## 🔄 Updating

### Auto-Update (In-App)

NoteX checks for updates automatically on launch. When a new version is available, a notification appears in the bottom-right corner. Click **"Download & Install"** to update and restart.

### CLI Update

```bash
notex-update
```

### Manual Update

Download the latest release from [GitHub Releases](https://github.com/uchihashahin01/NoteX/releases/latest) and install it the same way you did initially.

---

## 🚀 Releasing New Versions (For Maintainers)

To publish a new release:

```bash
# 1. Bump the version in src-tauri/tauri.conf.json and package.json
# 2. Commit the version bump
git add -A && git commit -m "chore: bump version to vX.Y.Z"

# 3. Create and push a version tag
git tag vX.Y.Z
git push origin main --tags
```

GitHub Actions will automatically:
1. Build the app for Linux (`.deb`, `.rpm`, `.AppImage`)
2. Generate updater artifacts (`latest.json`)
3. Create a GitHub Release with all assets attached

**Required GitHub Secrets** (set in repo Settings > Secrets):
- `TAURI_SIGNING_PRIVATE_KEY` — contents of `src-tauri/keys/.private.key`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — the password used when generating the key (empty string if none)

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
├── .github/workflows/      # CI/CD
│   └── release.yml         # Auto-build on tag push
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── Editor.tsx      # TipTap rich text editor
│   │   ├── Sidebar.tsx     # File tree sidebar
│   │   ├── TopBar.tsx      # Top navigation bar
│   │   ├── CodeBlockWrapper.tsx  # Code copy buttons
│   │   ├── ContextMenu.tsx # Right-click menu
│   │   ├── Modal.tsx       # Create/rename dialogs
│   │   ├── UpdateChecker.tsx # In-app update notification
│   │   └── WelcomeScreen.tsx
│   ├── store/              # Zustand state management
│   ├── styles/             # CSS styles
│   └── utils/              # Markdown conversion
├── src-tauri/              # Rust backend
│   ├── src/lib.rs          # Tauri commands & system tray
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── install.sh              # CLI installer/updater script
├── package.json
└── vite.config.ts
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
