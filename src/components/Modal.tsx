import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { FileNode } from '../store/useAppStore';
import { X, Folder, ChevronRight, ChevronDown } from 'lucide-react';

export default function Modal() {
  const { modal, setModal, createNote, createFolder, renameItem, openNote, moveNoteTo, fileTree, notesDirectory } = useAppStore();

  if (!modal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={() => setModal(null)}
    >
      <div
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 24,
          width: 400,
          maxWidth: '90vw',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {modal.type === 'create-note' && (
          <CreateNoteModal
            folderPath={(modal.data?.folderPath as string) || ''}
            onClose={() => setModal(null)}
            onCreate={async (name) => {
              const path = await createNote((modal.data?.folderPath as string) || '', name);
              setModal(null);
              openNote(path);
            }}
          />
        )}
        {modal.type === 'create-folder' && (
          <CreateFolderModal
            onClose={() => setModal(null)}
            onCreate={async (name) => {
              await createFolder((modal.data?.parentPath as string) || '', name);
              setModal(null);
            }}
          />
        )}
        {modal.type === 'rename' && (
          <RenameModal
            currentName={(modal.data?.name as string) || ''}
            onClose={() => setModal(null)}
            onRename={async (newName) => {
              await renameItem((modal.data?.path as string) || '', newName);
              setModal(null);
            }}
          />
        )}
        {modal.type === 'move-to' && (
          <MoveToModal
            fileTree={fileTree}
            notesDirectory={notesDirectory}
            onClose={() => setModal(null)}
            onMove={async (targetFolder) => {
              await moveNoteTo(targetFolder);
              setModal(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function CreateNoteModal({
  onClose,
  onCreate,
}: {
  folderPath: string;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError('');
    onCreate(name.trim());
  };

  return (
    <>
      <ModalHeader title="Create New Note" onClose={onClose} />
      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
          Note Name
        </label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="My Note"
          style={inputStyle}
        />
        {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{error}</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
        <ModalButton label="Cancel" onClick={onClose} variant="secondary" />
        <ModalButton label="Create" onClick={handleSubmit} variant="primary" />
      </div>
    </>
  );
}

function CreateFolderModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError('');
    onCreate(name.trim());
  };

  return (
    <>
      <ModalHeader title="Create New Folder" onClose={onClose} />
      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
          Folder Name
        </label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="My Folder"
          style={inputStyle}
        />
        {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{error}</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
        <ModalButton label="Cancel" onClick={onClose} variant="secondary" />
        <ModalButton label="Create" onClick={handleSubmit} variant="primary" />
      </div>
    </>
  );
}

function RenameModal({
  currentName,
  onClose,
  onRename,
}: {
  currentName: string;
  onClose: () => void;
  onRename: (newName: string) => void;
}) {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError('');
    onRename(name.trim());
  };

  return (
    <>
      <ModalHeader title="Rename" onClose={onClose} />
      <div style={{ marginTop: 16 }}>
        <label style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
          New Name
        </label>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={inputStyle}
        />
        {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{error}</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
        <ModalButton label="Cancel" onClick={onClose} variant="secondary" />
        <ModalButton label="Rename" onClick={handleSubmit} variant="primary" />
      </div>
    </>
  );
}

function MoveToModal({
  fileTree,
  notesDirectory,
  onClose,
  onMove,
}: {
  fileTree: FileNode[];
  notesDirectory: string;
  onClose: () => void;
  onMove: (targetFolder: string) => void;
}) {
  const [selectedFolder, setSelectedFolder] = useState<string>(notesDirectory);
  const [expanded, setExpanded] = useState<Set<string>>(new Set([notesDirectory]));

  const toggleExpand = (path: string) => {
    const next = new Set(expanded);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpanded(next);
  };

  const renderFolders = (nodes: FileNode[], depth: number) => {
    return nodes
      .filter((n) => n.is_dir)
      .map((node) => {
        const isExpanded = expanded.has(node.path);
        const isSelected = selectedFolder === node.path;
        const children = node.children?.filter((c) => c.is_dir) || [];
        return (
          <div key={node.path}>
            <div
              onClick={() => setSelectedFolder(node.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 8px',
                paddingLeft: 8 + depth * 16,
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? 'var(--bg-active)' : 'transparent',
                color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                fontSize: 13,
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {children.length > 0 ? (
                <span
                  onClick={(e) => { e.stopPropagation(); toggleExpand(node.path); }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              ) : (
                <span style={{ width: 14 }} />
              )}
              <Folder size={14} />
              <span>{node.name}</span>
            </div>
            {isExpanded && children.length > 0 && renderFolders(children, depth + 1)}
          </div>
        );
      });
  };

  const isRootSelected = selectedFolder === notesDirectory;

  return (
    <>
      <ModalHeader title="Move to" onClose={onClose} />
      <div
        style={{
          marginTop: 16,
          maxHeight: 300,
          overflowY: 'auto',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 4,
        }}
      >
        {/* Root folder */}
        <div
          onClick={() => setSelectedFolder(notesDirectory)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 8px',
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
            background: isRootSelected ? 'var(--bg-active)' : 'transparent',
            color: isRootSelected ? 'var(--accent)' : 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            if (!isRootSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            if (!isRootSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <Folder size={14} />
          <span>NoteX (root)</span>
        </div>
        {renderFolders(fileTree, 1)}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
        <ModalButton label="Cancel" onClick={onClose} variant="secondary" />
        <ModalButton label="Move" onClick={() => onMove(selectedFolder)} variant="primary" />
      </div>
    </>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-tertiary)',
          padding: 4,
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          transition: 'color 0.1s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
}

function ModalButton({
  label,
  onClick,
  variant,
}: {
  label: string;
  onClick: () => void;
  variant: 'primary' | 'secondary';
}) {
  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 20px',
        borderRadius: 'var(--radius-md)',
        border: isPrimary ? 'none' : '1px solid var(--border)',
        background: isPrimary ? 'var(--accent)' : 'transparent',
        color: isPrimary ? '#fff' : 'var(--text-primary)',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background 0.2s, transform 0.1s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = isPrimary
          ? 'var(--accent-hover)'
          : 'var(--bg-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = isPrimary
          ? 'var(--accent)'
          : 'transparent';
      }}
    >
      {label}
    </button>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  marginTop: 8,
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  transition: 'border-color 0.2s',
};
