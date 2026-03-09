import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  children?: FileNode[];
}

export interface SearchResult {
  path: string;
  line: string;
  lineNumber: number;
}

interface AppState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Sidebar
  sidebarOpen: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;

  // File tree
  fileTree: FileNode[];
  expandedFolders: Set<string>;
  loadFileTree: () => Promise<void>;
  toggleFolder: (path: string) => void;

  // Active note
  activeNotePath: string | null;
  activeNoteContent: string;
  isNoteDirty: boolean;
  openNote: (path: string) => Promise<void>;
  setNoteContent: (content: string) => void;
  saveNote: () => Promise<void>;

  // File operations
  createNote: (folderPath: string, name: string) => Promise<string>;
  createFolder: (parentPath: string, name: string) => Promise<string>;
  deleteItem: (path: string) => Promise<void>;
  renameItem: (oldPath: string, newName: string) => Promise<string>;

  // Search
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => Promise<void>;

  // Notes directory
  notesDirectory: string;
  loadNotesDirectory: () => Promise<void>;

  // Context menu
  contextMenu: { x: number; y: number; target: FileNode } | null;
  setContextMenu: (menu: { x: number; y: number; target: FileNode } | null) => void;

  // Modal
  modal: { type: string; data?: Record<string, unknown> } | null;
  setModal: (modal: { type: string; data?: Record<string, unknown> } | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Theme
  theme: (localStorage.getItem('notex-theme') as 'light' | 'dark') || 'dark',
  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('notex-theme', newTheme);
    set({ theme: newTheme });
  },

  // Sidebar
  sidebarOpen: true,
  sidebarWidth: 280,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(200, Math.min(500, width)) }),

  // File tree
  fileTree: [],
  expandedFolders: new Set<string>(),
  loadFileTree: async () => {
    try {
      const tree = await invoke<FileNode[]>('get_file_tree');
      set({ fileTree: tree });
    } catch (e) {
      console.error('Failed to load file tree:', e);
    }
  },
  toggleFolder: (path) => {
    const expanded = new Set(get().expandedFolders);
    if (expanded.has(path)) {
      expanded.delete(path);
    } else {
      expanded.add(path);
    }
    set({ expandedFolders: expanded });
  },

  // Active note
  activeNotePath: null,
  activeNoteContent: '',
  isNoteDirty: false,
  openNote: async (path) => {
    // Save current note if dirty
    if (get().isNoteDirty && get().activeNotePath) {
      await get().saveNote();
    }
    try {
      const content = await invoke<string>('read_note', { path });
      set({ activeNotePath: path, activeNoteContent: content, isNoteDirty: false });
    } catch (e) {
      console.error('Failed to open note:', e);
    }
  },
  setNoteContent: (content) => {
    set({ activeNoteContent: content, isNoteDirty: true });
  },
  saveNote: async () => {
    const { activeNotePath, activeNoteContent } = get();
    if (!activeNotePath) return;
    try {
      await invoke('save_note', { path: activeNotePath, content: activeNoteContent });
      set({ isNoteDirty: false });
    } catch (e) {
      console.error('Failed to save note:', e);
    }
  },

  // File operations
  createNote: async (folderPath, name) => {
    const path = await invoke<string>('create_note', { folderPath, name });
    await get().loadFileTree();
    return path;
  },
  createFolder: async (parentPath, name) => {
    const path = await invoke<string>('create_folder', { parentPath, name });
    await get().loadFileTree();
    return path;
  },
  deleteItem: async (path) => {
    await invoke('delete_item', { path });
    if (get().activeNotePath === path) {
      set({ activeNotePath: null, activeNoteContent: '', isNoteDirty: false });
    }
    await get().loadFileTree();
  },
  renameItem: async (oldPath, newName) => {
    const newPath = await invoke<string>('rename_item', { oldPath, newName });
    if (get().activeNotePath === oldPath) {
      set({ activeNotePath: newPath });
    }
    await get().loadFileTree();
    return newPath;
  },

  // Search
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  setSearchQuery: (query) => set({ searchQuery: query }),
  performSearch: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }
    set({ isSearching: true });
    try {
      const results = await invoke<[string, string, number][]>('search_notes', { query });
      set({
        searchResults: results.map(([path, line, lineNumber]) => ({ path, line, lineNumber })),
        isSearching: false,
      });
    } catch (e) {
      console.error('Search failed:', e);
      set({ isSearching: false });
    }
  },

  // Notes directory
  notesDirectory: '',
  loadNotesDirectory: async () => {
    try {
      const dir = await invoke<string>('get_notes_directory');
      set({ notesDirectory: dir });
    } catch (e) {
      console.error('Failed to get notes directory:', e);
    }
  },

  // Context menu
  contextMenu: null,
  setContextMenu: (menu) => set({ contextMenu: menu }),

  // Modal
  modal: null,
  setModal: (modal) => set({ modal }),
}));
