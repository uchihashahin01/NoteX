import { useAppStore } from '../store/useAppStore';
import {
  FileText,
  FolderPlus,
  Trash2,
  Pencil,
} from 'lucide-react';

export default function ContextMenu() {
  const { contextMenu, setContextMenu, setModal, deleteItem } = useAppStore();

  if (!contextMenu) return null;

  const { x, y, target } = contextMenu;

  const items = [
    ...(target.is_dir
      ? [
          {
            icon: <FileText size={14} />,
            label: 'New Note',
            onClick: () => {
              setModal({ type: 'create-note', data: { folderPath: target.path } });
              setContextMenu(null);
            },
          },
          {
            icon: <FolderPlus size={14} />,
            label: 'New Folder',
            onClick: () => {
              setModal({ type: 'create-folder', data: { parentPath: target.path } });
              setContextMenu(null);
            },
          },
        ]
      : []),
    {
      icon: <Pencil size={14} />,
      label: 'Rename',
      onClick: () => {
        setModal({ type: 'rename', data: { path: target.path, name: target.name } });
        setContextMenu(null);
      },
    },
    {
      icon: <Trash2 size={14} />,
      label: 'Delete',
      danger: true,
      onClick: () => {
        if (window.confirm(`Delete "${target.name}"? This cannot be undone.`)) {
          deleteItem(target.path);
        }
        setContextMenu(null);
      },
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
      }}
      onClick={() => setContextMenu(null)}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextMenu(null);
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: y,
          left: x,
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          padding: 4,
          minWidth: 180,
          zIndex: 1001,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={item.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: 13,
              color: item.danger ? 'var(--danger)' : 'var(--text-primary)',
              textAlign: 'left',
              transition: 'background 0.1s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = item.danger
                ? 'rgba(234, 67, 53, 0.1)'
                : 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
