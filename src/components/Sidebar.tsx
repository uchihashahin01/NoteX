import { useState, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FolderOpen,
  Folder,
  Plus,
  FolderPlus,
  Search,
} from 'lucide-react';
import { useAppStore, type FileNode } from '../store/useAppStore';

export default function Sidebar() {
  const {
    fileTree,
    expandedFolders,
    toggleFolder,
    activeNotePath,
    openNote,
    sidebarWidth,
    setSidebarWidth,
    setContextMenu,
    setModal,
    searchQuery,
    setSearchQuery,
    performSearch,
    searchResults,
    isSearching,
    notesDirectory,
  } = useAppStore();

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      const startX = e.clientX;
      const startWidth = sidebarWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = startWidth + (e.clientX - startX);
        setSidebarWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [sidebarWidth, setSidebarWidth]
  );

  const [searchMode, setSearchMode] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      performSearch(value);
    }
  };

  return (
    <div
      ref={sidebarRef}
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        position: 'relative',
        userSelect: isResizing ? 'none' : 'auto',
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent), #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            N
          </div>
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
            NoteX
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconButton
            icon={<Search size={16} />}
            onClick={() => setSearchMode(!searchMode)}
            title="Search notes"
          />
          <IconButton
            icon={<Plus size={16} />}
            onClick={() => setModal({ type: 'create-note', data: { folderPath: notesDirectory } })}
            title="New note"
          />
          <IconButton
            icon={<FolderPlus size={16} />}
            onClick={() =>
              setModal({ type: 'create-folder', data: { parentPath: notesDirectory } })
            }
            title="New folder"
          />
        </div>
      </div>

      {/* Search */}
      {searchMode && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
            }}
          >
            <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '13px',
                width: '100%',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>

          {/* Search results */}
          {searchQuery && (
            <div style={{ marginTop: 8, maxHeight: 300, overflowY: 'auto' }}>
              {isSearching ? (
                <div
                  style={{ padding: 8, color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center' }}
                >
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div
                  style={{ padding: 8, color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center' }}
                >
                  No results found
                </div>
              ) : (
                searchResults.map((result, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: 12,
                      borderBottom: '1px solid var(--border-light)',
                    }}
                    className="hover-bg"
                    onClick={() => {
                      openNote(result.path);
                      setSearchMode(false);
                      setSearchQuery('');
                    }}
                  >
                    <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                      {result.path.split('/').pop()}
                    </div>
                    <div
                      style={{
                        color: 'var(--text-tertiary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      L{result.lineNumber}: {result.line}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* File Tree */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {fileTree.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: 13,
            }}
          >
            <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
            <p>No notes yet</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Create your first note to get started</p>
          </div>
        ) : (
          fileTree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              depth={0}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              activeNotePath={activeNotePath}
              openNote={openNote}
              setContextMenu={setContextMenu}
            />
          ))
        )}
      </div>

      {/* Notes directory info */}
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-tertiary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        📁 ~/NoteX
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          right: -2,
          width: 4,
          height: '100%',
          cursor: 'col-resize',
          zIndex: 10,
        }}
      />
    </div>
  );
}

function TreeNode({
  node,
  depth,
  expandedFolders,
  toggleFolder,
  activeNotePath,
  openNote,
  setContextMenu,
}: {
  node: FileNode;
  depth: number;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
  activeNotePath: string | null;
  openNote: (path: string) => Promise<void>;
  setContextMenu: (menu: { x: number; y: number; target: FileNode } | null) => void;
}) {
  const isExpanded = expandedFolders.has(node.path);
  const isActive = activeNotePath === node.path;

  const handleClick = () => {
    if (node.is_dir) {
      toggleFolder(node.path);
    } else {
      openNote(node.path);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, target: node });
  };

  const displayName = node.is_dir ? node.name : node.name.replace(/\.md$/, '');

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          paddingLeft: 12 + depth * 16,
          cursor: 'pointer',
          fontSize: 13,
          color: isActive ? 'var(--accent)' : 'var(--text-primary)',
          background: isActive ? 'var(--bg-active)' : 'transparent',
          borderRadius: 0,
          transition: 'background 0.1s',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
        }}
      >
        {node.is_dir ? (
          <>
            {isExpanded ? (
              <ChevronDown size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            ) : (
              <ChevronRight size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            )}
            {isExpanded ? (
              <FolderOpen size={15} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            ) : (
              <Folder size={15} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            )}
          </>
        ) : (
          <>
            <span style={{ width: 14, flexShrink: 0 }} />
            <FileText size={15} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          </>
        )}
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </span>
      </div>

      {node.is_dir && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              activeNotePath={activeNotePath}
              openNote={openNote}
              setContextMenu={setContextMenu}
            />
          ))}
          {node.children.length === 0 && (
            <div
              style={{
                paddingLeft: 12 + (depth + 1) * 16,
                padding: '4px 12px',
                fontSize: 12,
                color: 'var(--text-tertiary)',
                fontStyle: 'italic',
              }}
            >
              Empty folder
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IconButton({
  icon,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        padding: 4,
        cursor: 'pointer',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.1s, color 0.1s',
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
    </button>
  );
}
