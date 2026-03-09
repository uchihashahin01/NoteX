import { FileText, Plus, Keyboard } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function WelcomeScreen() {
  const { setModal, notesDirectory } = useAppStore();

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        {/* Logo */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'linear-gradient(135deg, var(--accent), #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <span style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>N</span>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Welcome to NoteX
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
          A modern note-taking app built for developers. Write markdown, highlight code,
          capture screenshots, and organize everything in one place.
        </p>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <WelcomeButton
            icon={<Plus size={18} />}
            label="Create Note"
            onClick={() => setModal({ type: 'create-note', data: { folderPath: notesDirectory } })}
            primary
          />
          <WelcomeButton
            icon={<FileText size={18} />}
            label="Open from Sidebar"
            onClick={() => {}}
            description="Select a note from the sidebar"
          />
        </div>

        {/* Keyboard shortcuts */}
        <div
          style={{
            marginTop: 48,
            padding: 20,
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
              justifyContent: 'center',
            }}
          >
            <Keyboard size={16} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Keyboard Shortcuts
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px 24px',
              fontSize: 12,
            }}
          >
            <Shortcut keys="Ctrl+S" action="Save note" />
            <Shortcut keys="Ctrl+B" action="Bold text" />
            <Shortcut keys="Ctrl+I" action="Italic text" />
            <Shortcut keys="Ctrl+U" action="Underline" />
            <Shortcut keys="Ctrl+E" action="Inline code" />
            <Shortcut keys="Ctrl+Shift+C" action="Code block" />
            <Shortcut keys="Ctrl+Z" action="Undo" />
            <Shortcut keys="Ctrl+Shift+Z" action="Redo" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeButton({
  icon,
  label,
  onClick,
  primary = false,
  description: _description,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  description?: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 24px',
        borderRadius: 'var(--radius-md)',
        border: primary ? 'none' : '1px solid var(--border)',
        background: primary ? 'var(--accent)' : 'var(--bg-secondary)',
        color: primary ? '#fff' : 'var(--text-primary)',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'transform 0.1s, box-shadow 0.2s',
        fontFamily: 'var(--font-sans)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function Shortcut({ keys, action }: { keys: string; action: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{action}</span>
      <kbd
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '2px 6px',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
        }}
      >
        {keys}
      </kbd>
    </div>
  );
}
