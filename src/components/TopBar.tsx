import {
  PanelLeft,
  Sun,
  Moon,
  Save,
  FileText,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function TopBar() {
  const {
    theme,
    toggleTheme,
    sidebarOpen,
    toggleSidebar,
    activeNotePath,
    isNoteDirty,
    saveNote,
  } = useAppStore();

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
          <TopBarButton
            icon={<Save size={16} />}
            onClick={saveNote}
            title="Save (Ctrl+S)"
            disabled={!isNoteDirty}
          />
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
