# NoteX Features

A comprehensive list of all features available in NoteX.

---

## 📝 Rich Text Editor

### Notion-like Block Editor
NoteX uses TipTap v3, a headless editor framework that provides a Notion-like editing experience. Every element is a "block" that can be independently formatted.

### Text Formatting
- **Bold** — `Ctrl+B` or toolbar
- **Italic** — `Ctrl+I` or toolbar
- **Underline** — `Ctrl+U` or toolbar
- **Strikethrough** — `Ctrl+Shift+X` or toolbar
- **Highlight** — toolbar highlight button (yellow background)
- **Inline Code** — `Ctrl+E` or backtick wrapping

### Headings
- **Heading 1** — Large section titles
- **Heading 2** — Subsection titles
- **Heading 3** — Sub-subsection titles
- All headings support text alignment (left, center, right)

### Lists
- **Bullet Lists** — unordered lists with disc markers
- **Numbered Lists** — ordered lists with decimal numbering
- **Task Lists** — interactive checkboxes for to-do items, supports nested tasks

### Blockquotes
- Styled quote blocks with left accent border
- Supports rich text inside blockquotes

### Horizontal Rules
- Visual dividers between sections

### Text Alignment
- Left align (default)
- Center align
- Right align

---

## 💻 Code Highlighting

### Supported Languages (40+)
NoteX supports syntax highlighting for all major programming languages through highlight.js:

| Category | Languages |
|----------|-----------|
| **Web** | JavaScript, TypeScript, HTML, CSS, SCSS, PHP |
| **Systems** | Rust, C++, C#, Go, Java, Swift, Kotlin |
| **Scripting** | Python, Ruby, Perl, Lua, Bash, Shell, PowerShell |
| **Data** | SQL, JSON, YAML, XML, INI |
| **Functional** | Haskell, Scala, Elixir, Erlang, Clojure |
| **DevOps** | Dockerfile, Nginx, Makefile |
| **Other** | R, Vim, Diff, Markdown |

### Copy Code Button
- Every code block has a **copy button** that appears on hover
- One click copies the entire code block to clipboard
- Visual feedback: button changes to "Copied!" with a checkmark for 2 seconds
- Language label displayed in the top-left corner of each code block

### Language Detection
- Automatic language label display
- Language selector visible on hover
- Proper syntax coloring for each language with theme-aware colors

---

## 🖼️ Screenshot & Image Support

### Clipboard Paste
- **Ctrl+V** to paste screenshots directly from clipboard
- Supports any image format copied to clipboard
- Instant insertion at cursor position

### Drag & Drop
- Drag image files directly from file manager into the editor
- Supports multiple file drops at once
- Accepted formats: PNG, JPG, GIF, WebP, SVG, BMP

### File Upload
- Toolbar image button opens a file picker
- Select any image file from disk

### Image Storage
- Images are saved locally in a `.assets` folder alongside notes
- Each image gets a unique UUID filename to prevent conflicts
- Base64 fallback for inline images when local save fails

### Image Display
- Responsive sizing (max-width: 100%)
- Rounded corners for a polished look
- Hover shadow effect
- Selection highlight when clicked
- Images are stored as Markdown image syntax in .md files

---

## 📁 File Management

### Tree-like Sidebar
- **Collapsible folder tree** for hierarchical organization
- Folders displayed with open/closed icons
- Files shown with document icon
- Active note highlighted with accent color
- **Resizable sidebar** — drag the right edge to adjust width (200-500px range)

### File Operations
- **Create Note** — `+` button or right-click context menu on folder
- **Create Folder** — folder+ button or right-click context menu
- **Rename** — right-click context menu
- **Delete** — right-click context menu with confirmation dialog

### File Format
- All notes saved as standard `.md` (Markdown) files
- Compatible with any Markdown viewer/editor
- Easy to version control with Git
- Human-readable plain text format

### Storage Location
- Default: `~/NoteX/` in user home directory
- Hidden files (starting with `.`) are excluded from the tree
- `.assets/` folders store images alongside notes

---

## 🔍 Search

### Full-Text Search
- Search across all notes content
- Minimum 2 characters to trigger search
- Shows matching file name, line number, and matching text
- Click any result to open that note instantly
- Maximum 100 results returned for performance

### Search UI
- Toggle search with the magnifying glass icon in sidebar
- Real-time results as you type
- Search results appear inline in the sidebar
- Highlighting of matching text

---

## 🎨 Themes

### Dark Mode
- Deep blue-navy color scheme (`#1a1a2e` base)
- Reduced eye strain for long coding sessions
- Consistent dark theme across all UI elements
- High contrast text for readability
- Proper code highlighting colors for dark backgrounds

### Light Mode
- Clean white color scheme
- Professional appearance
- Optimized for well-lit environments
- Subtle shadows and borders

### Theme Toggle
- Sun/Moon icon in the top bar
- Instant switching with smooth transition
- Theme preference persisted in localStorage
- Default: Dark mode

### CSS Custom Properties
- All colors use CSS variables for consistent theming
- Easy to customize or extend with new themes
- Smooth 200ms transition on theme change

---

## 🔔 System Tray

### Background Running
- Closing the window **does not quit** the app
- Window is hidden and app continues running in background
- Minimal resource usage when minimized to tray

### Tray Icon
- Application icon visible in system tray
- **Double-click** to restore the window
- **Right-click** for context menu

### Tray Context Menu
- **Show NoteX** — restore and focus the window
- **Quit NoteX** — fully exit the application (only way to fully close)

### Behavior
- Window close button = minimize to tray
- Tray double-click = show window
- Only right-click → Quit will fully exit

---

## ⌨️ Keyboard Shortcuts

| Category | Shortcut | Action |
|----------|----------|--------|
| **File** | `Ctrl+S` | Save current note |
| **Format** | `Ctrl+B` | Bold text |
| **Format** | `Ctrl+I` | Italic text |
| **Format** | `Ctrl+U` | Underline text |
| **Format** | `Ctrl+E` | Inline code |
| **Format** | `Ctrl+Shift+C` | Toggle code block |
| **Format** | `Ctrl+Shift+X` | Strikethrough |

---

## 💾 Auto-Save

- Notes are automatically saved **5 seconds** after the last edit
- Unsaved changes indicated by a yellow dot next to the file name
- Manual save available via `Ctrl+S` or the save button
- No data loss on unexpected close

---

## 🎯 Bubble Menu

### Selection-based Toolbar
- Appears when text is selected
- Provides quick access to formatting options
- Does not appear inside code blocks
- Compact floating toolbar near the selection

### Available Actions
- Bold, Italic, Underline
- Strikethrough
- Inline code
- Highlight

---

## 🏛️ Architecture

### Performance
- **RAM Usage**: ~30-50 MB (compared to 150-300 MB for Electron apps)
- **Binary Size**: ~4 MB (.deb package)
- **Startup Time**: < 1 second
- **Rendering**: Native WebView (not bundled Chromium)

### Security
- Path validation: All file operations restricted to `~/NoteX/` directory
- Filename sanitization: Special characters replaced to prevent injection
- No network access required
- Content Security Policy configured
- Tauri permission system for controlled API access

### Portability
- Notes are standard Markdown files
- No proprietary format lock-in
- Can be opened with any text editor
- Git-friendly for version control
