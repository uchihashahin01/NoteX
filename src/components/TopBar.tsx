import { useState, useRef, useEffect } from 'react';
import {
  PanelLeft,
  Sun,
  Moon,
  Save,
  FileText,
  Download,
  MoreHorizontal,
  Type,
  Maximize2,
  Copy,
  FolderInput,
  Lock,
  Check,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function TopBar() {
  const {
    theme,
    toggleTheme,
    sidebarOpen,
    toggleSidebar,
    activeNotePath,
    activeNoteContent,
    isNoteDirty,
    saveNote,
    pageSmallText,
    pageFullWidth,
    pageLocked,
    toggleSmallText,
    toggleFullWidth,
    toggleLockPage,
    duplicateNote,
    setModal,
  } = useAppStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const fileName = activeNotePath
    ? activeNotePath.split('/').pop()?.replace(/\.md$/, '') || 'Untitled'
    : null;

  return (
    <div
      style={{
        height: 'var(--topbar-height)',
        minHeight: 'var(--topbar-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-primary)',
        gap: 12,
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TopBarButton
          icon={<PanelLeft size={18} />}
          onClick={toggleSidebar}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          active={sidebarOpen}
        />

        {fileName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={14} style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
              {fileName}
            </span>
            {isNoteDirty && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--warning)',
                  display: 'inline-block',
                }}
                title="Unsaved changes"
              />
            )}
          </div>
        )}
      </div>

      {/* Center - breadcrumb */}
      {activeNotePath && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-tertiary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 400,
          }}
        >
          {activeNotePath
            .replace(/^.*\/NoteX\//, '')
            .split('/')
            .join(' / ')}
        </div>
      )}

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {activeNotePath && (
          <>
            <TopBarButton
              icon={<Save size={16} />}
              onClick={saveNote}
              title="Save (Ctrl+S)"
              disabled={!isNoteDirty}
            />
            <TopBarButton
              icon={<Download size={16} />}
              onClick={() => {
                const name = activeNotePath.split('/').pop() || 'note.md';
                const blob = new Blob([activeNoteContent], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = name;
                a.click();
                URL.revokeObjectURL(url);
              }}
              title="Export as .md file"
            />
            {/* Three-dot menu */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <TopBarButton
                icon={<MoreHorizontal size={16} />}
                onClick={() => setMenuOpen((v) => !v)}
                title="Page options"
                active={menuOpen}
              />
              {menuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: 200,
                    padding: '4px 0',
                    zIndex: 1000,
                  }}
                >
                  <MenuToggleItem
                    icon={<Type size={15} />}
                    label="Small text"
                    checked={pageSmallText}
                    onClick={() => toggleSmallText()}
                  />
                  <MenuToggleItem
                    icon={<Maximize2 size={15} />}
                    label="Full width"
                    checked={pageFullWidth}
                    onClick={() => toggleFullWidth()}
                  />
                  <MenuDivider />
                  <MenuItem
                    icon={<Copy size={15} />}
                    label="Duplicate"
                    onClick={() => {
                      duplicateNote();
                      setMenuOpen(false);
                    }}
                  />
                  <MenuItem
                    icon={<FolderInput size={15} />}
                    label="Move to"
                    onClick={() => {
                      setModal({ type: 'move-to', data: { path: activeNotePath } });
                      setMenuOpen(false);
                    }}
                  />
                  <MenuDivider />
                  <MenuToggleItem
                    icon={<Lock size={15} />}
                    label="Lock page"
                    checked={pageLocked}
                    onClick={() => toggleLockPage()}
                  />
                </div>
              )}
            </div>
          </>
        )}
        <TopBarButton
          icon={theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        />
      </div>
    </div>
  );
}

function TopBarButton({
  icon,
  onClick,
  title,
  active = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        background: active ? 'var(--bg-hover)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '6px 8px',
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'var(--text-tertiary)' : 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.background = active
            ? 'var(--bg-hover)'
            : 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
        }
      }}
    >
      {icon}
    </button>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '8px 14px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        fontSize: 13,
        textAlign: 'left',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MenuToggleItem({
  icon,
  label,
  checked,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '8px 14px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        fontSize: 13,
        textAlign: 'left',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
      }}
    >
      {icon}
      <span style={{ flex: 1 }}>{label}</span>
      {checked && <Check size={14} style={{ color: 'var(--accent)' }} />}
    </button>
  );
}

function MenuDivider() {
  return (
    <div
      style={{
        height: 1,
        background: 'var(--border)',
        margin: '4px 0',
      }}
    />
  );
}
