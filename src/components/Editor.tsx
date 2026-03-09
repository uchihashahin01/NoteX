import { useEffect, useCallback, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { common, createLowlight } from 'lowlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { markdownToHtml, htmlToMarkdown } from '../utils/markdown';
import CodeBlockView from './CodeBlockView';
import { ReactNodeViewRenderer } from '@tiptap/react';

const lowlight = createLowlight(common);

// Register additional languages
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
import yaml from 'highlight.js/lib/languages/yaml';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import markdown from 'highlight.js/lib/languages/markdown';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import nginx from 'highlight.js/lib/languages/nginx';
import lua from 'highlight.js/lib/languages/lua';
import perl from 'highlight.js/lib/languages/perl';
import r from 'highlight.js/lib/languages/r';
import scala from 'highlight.js/lib/languages/scala';
import haskell from 'highlight.js/lib/languages/haskell';
import elixir from 'highlight.js/lib/languages/elixir';
import erlang from 'highlight.js/lib/languages/erlang';
import clojure from 'highlight.js/lib/languages/clojure';
import powershell from 'highlight.js/lib/languages/powershell';
import vim from 'highlight.js/lib/languages/vim';
import diff from 'highlight.js/lib/languages/diff';
import ini from 'highlight.js/lib/languages/ini';
import makefile from 'highlight.js/lib/languages/makefile';

lowlight.register('javascript', javascript);
lowlight.register('js', javascript);
lowlight.register('typescript', typescript);
lowlight.register('ts', typescript);
lowlight.register('python', python);
lowlight.register('py', python);
lowlight.register('rust', rust);
lowlight.register('go', go);
lowlight.register('java', java);
lowlight.register('cpp', cpp);
lowlight.register('c++', cpp);
lowlight.register('csharp', csharp);
lowlight.register('c#', csharp);
lowlight.register('php', php);
lowlight.register('ruby', ruby);
lowlight.register('rb', ruby);
lowlight.register('swift', swift);
lowlight.register('kotlin', kotlin);
lowlight.register('sql', sql);
lowlight.register('bash', bash);
lowlight.register('sh', bash);
lowlight.register('shell', shell);
lowlight.register('yaml', yaml);
lowlight.register('yml', yaml);
lowlight.register('json', json);
lowlight.register('xml', xml);
lowlight.register('html', xml);
lowlight.register('css', css);
lowlight.register('scss', scss);
lowlight.register('markdown', markdown);
lowlight.register('md', markdown);
lowlight.register('dockerfile', dockerfile);
lowlight.register('docker', dockerfile);
lowlight.register('nginx', nginx);
lowlight.register('lua', lua);
lowlight.register('perl', perl);
lowlight.register('r', r);
lowlight.register('scala', scala);
lowlight.register('haskell', haskell);
lowlight.register('elixir', elixir);
lowlight.register('erlang', erlang);
lowlight.register('clojure', clojure);
lowlight.register('powershell', powershell);
lowlight.register('ps1', powershell);
lowlight.register('vim', vim);
lowlight.register('diff', diff);
lowlight.register('ini', ini);
lowlight.register('makefile', makefile);

export default function Editor() {
  const { activeNoteContent, setNoteContent, activeNotePath, pageSmallText, pageFullWidth, pageLocked } = useAppStore();
  const isLoadingRef = useRef(false);
  const [toolbarVisible, setToolbarVisible] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing... Use "/" for commands',
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockView);
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      HorizontalRule,
    ],
    content: '',
    editable: !pageLocked,
    onUpdate: ({ editor }) => {
      if (isLoadingRef.current) return;
      const html = editor.getHTML();
      const md = htmlToMarkdown(html);
      setNoteContent(md);
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          event.preventDefault();
          handleImageFiles(files, view.state.selection.from);
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              event.preventDefault();
              const file = items[i].getAsFile();
              if (file) {
                handleImageFile(file, view.state.selection.from);
              }
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  const handleImageFile = useCallback(
    async (file: File, _pos: number) => {
      if (!editor) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const ext = file.type.split('/')[1] || 'png';

        // Save image via Tauri backend
        import('@tauri-apps/api/core').then(({ invoke }) => {
          invoke<string>('save_image', {
            folderPath: '',
            imageData: base64,
            extension: ext,
          }).then((savedPath) => {
            editor
              .chain()
              .focus()
              .setImage({ src: `asset://localhost/${savedPath}` })
              .run();
          }).catch(() => {
            // Fallback to base64 inline
            editor
              .chain()
              .focus()
              .setImage({ src: reader.result as string })
              .run();
          });
        });
      };
      reader.readAsDataURL(file);
    },
    [editor]
  );

  const handleImageFiles = useCallback(
    (files: FileList, pos: number) => {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          handleImageFile(files[i], pos);
        }
      }
    },
    [handleImageFile]
  );

  // Toggle editor editable when lock changes
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!pageLocked);
  }, [pageLocked, editor]);

  // Load content when active note changes
  useEffect(() => {
    if (!editor || !activeNotePath) return;
    isLoadingRef.current = true;
    const html = markdownToHtml(activeNoteContent);
    editor.commands.setContent(html);
    isLoadingRef.current = false;
    // Only re-run when the path changes (new note opened)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNotePath, editor]);

  if (!editor) return null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Floating toolbar */}
      {toolbarVisible && (
        <EditorToolbar editor={editor} onToggle={() => setToolbarVisible(false)} />
      )}

      {/* Bubble menu on text selection */}
      <BubbleMenu
        editor={editor}
        className="bubble-menu"
        shouldShow={({ editor, from, to }: { editor: any; from: number; to: number }) => {
          return from !== to && !editor.isActive('codeBlock');
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 2,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: 4,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <BubbleButton
            icon={<Bold size={14} />}
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <BubbleButton
            icon={<Italic size={14} />}
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <BubbleButton
            icon={<UnderlineIcon size={14} />}
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <BubbleButton
            icon={<Strikethrough size={14} />}
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <BubbleButton
            icon={<Code size={14} />}
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
          />
          <BubbleButton
            icon={<Highlighter size={14} />}
            active={editor.isActive('highlight')}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          />
        </div>
      </BubbleMenu>

      {/* Editor content */}
      <div className="tiptap-editor-scroll">
        <div
          className={`tiptap-editor${pageFullWidth ? ' full-width' : ''}${pageSmallText ? ' small-text' : ''}`}
          onClick={() => !toolbarVisible && setToolbarVisible(true)}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Status bar */}
      <EditorStatusBar editor={editor} />
    </div>
  );
}

function EditorToolbar({
  editor,
  onToggle: _onToggle,
}: {
  editor: ReturnType<typeof useEditor>;
  onToggle: () => void;
}) {
  if (!editor) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: '6px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-primary)',
        flexWrap: 'wrap',
        minHeight: 40,
      }}
    >
      <ToolbarGroup>
        <ToolbarButton
          icon={<Undo size={15} />}
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        />
        <ToolbarButton
          icon={<Redo size={15} />}
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Shift+Z)"
        />
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <ToolbarButton
          icon={<Heading1 size={16} />}
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        />
        <ToolbarButton
          icon={<Heading2 size={16} />}
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        />
        <ToolbarButton
          icon={<Heading3 size={16} />}
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        />
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <ToolbarButton
          icon={<Bold size={15} />}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          icon={<Italic size={15} />}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          icon={<UnderlineIcon size={15} />}
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
        />
        <ToolbarButton
          icon={<Strikethrough size={15} />}
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        />
        <ToolbarButton
          icon={<Highlighter size={15} />}
          active={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Highlight"
        />
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <ToolbarButton
          icon={<List size={15} />}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        />
        <ToolbarButton
          icon={<ListOrdered size={15} />}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered list"
        />
        <ToolbarButton
          icon={<ListTodo size={15} />}
          active={editor.isActive('taskList')}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          title="Task list"
        />
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <ToolbarButton
          icon={<AlignLeft size={15} />}
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align left"
        />
        <ToolbarButton
          icon={<AlignCenter size={15} />}
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align center"
        />
        <ToolbarButton
          icon={<AlignRight size={15} />}
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align right"
        />
      </ToolbarGroup>

      <ToolbarDivider />

      <ToolbarGroup>
        <ToolbarButton
          icon={<Code size={15} />}
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code block"
        />
        <ToolbarButton
          icon={<Quote size={15} />}
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        />
        <ToolbarButton
          icon={<Minus size={15} />}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        />
        <ToolbarButton
          icon={<ImageIcon size={15} />}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = () => {
              const file = input.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  editor
                    .chain()
                    .focus()
                    .setImage({ src: reader.result as string })
                    .run();
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          }}
          title="Insert image"
        />
      </ToolbarGroup>
    </div>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 1 }}>{children}</div>;
}

function ToolbarDivider() {
  return (
    <div
      style={{
        width: 1,
        height: 20,
        background: 'var(--border)',
        margin: '0 6px',
      }}
    />
  );
}

function ToolbarButton({
  icon,
  active = false,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: active ? 'var(--bg-active)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '4px 6px',
        cursor: 'pointer',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = active
          ? 'var(--bg-active)'
          : 'transparent';
      }}
    >
      {icon}
    </button>
  );
}

function BubbleButton({
  icon,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--bg-active)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '4px 6px',
        cursor: 'pointer',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = active
          ? 'var(--bg-active)'
          : 'transparent';
      }}
    >
      {icon}
    </button>
  );
}

function EditorStatusBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const text = editor.state.doc.textContent;
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 16,
        padding: '4px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-primary)',
        fontSize: 11,
        color: 'var(--text-tertiary)',
        minHeight: 24,
      }}
    >
      <span>{wordCount} words</span>
      <span>{charCount} characters</span>
    </div>
  );
}
