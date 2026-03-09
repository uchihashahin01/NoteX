import { useEffect, useCallback } from 'react';
import { useAppStore } from './store/useAppStore';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import TopBar from './components/TopBar';
import ContextMenu from './components/ContextMenu';
import Modal from './components/Modal';
import WelcomeScreen from './components/WelcomeScreen';

export default function App() {
  const {
    theme,
    sidebarOpen,
    activeNotePath,
    loadFileTree,
    loadNotesDirectory,
    saveNote,
    isNoteDirty,
    setContextMenu,
  } = useAppStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    loadFileTree();
    loadNotesDirectory();
  }, [loadFileTree, loadNotesDirectory]);

  // Auto-save every 5 seconds if dirty
  useEffect(() => {
    if (!isNoteDirty) return;
    const timer = setTimeout(() => {
      saveNote();
    }, 5000);
    return () => clearTimeout(timer);
  }, [isNoteDirty, saveNote]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNote();
      }
    },
    [saveNote]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [setContextMenu]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
      }}
    >
      {sidebarOpen && <Sidebar />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar />
        {activeNotePath ? <Editor /> : <WelcomeScreen />}
      </div>
      <ContextMenu />
      <Modal />
    </div>
  );
}
