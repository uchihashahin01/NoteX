import { useEffect, useRef, useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';
import type { Editor } from '@tiptap/react';

export default function CodeBlockWrapper({
  editor,
  children,
}: {
  editor: Editor;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new MutationObserver(() => {
      attachCopyButtons();
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
    });

    // Initial attach
    attachCopyButtons();

    return () => observer.disconnect();
  }, [editor]);

  const attachCopyButtons = useCallback(() => {
    if (!containerRef.current) return;

    const codeBlocks = containerRef.current.querySelectorAll('pre');

    codeBlocks.forEach((pre) => {
      // Skip if already wrapped
      if (pre.parentElement?.classList.contains('code-block-wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';

      // Copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-button';
      copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy`;

      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const code = pre.querySelector('code');
        const text = code?.textContent || pre.textContent || '';
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy`;
            copyBtn.classList.remove('copied');
          }, 2000);
        });
      });

      // Language label
      const code = pre.querySelector('code');
      const langClass = code?.className?.match(/language-(\w+)/);
      if (langClass) {
        const langLabel = document.createElement('span');
        langLabel.className = 'language-select';
        langLabel.textContent = langClass[1];
        wrapper.appendChild(langLabel);
      }

      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      wrapper.appendChild(copyBtn);
    });
  }, []);

  return <div ref={containerRef}>{children}</div>;
}

// Standalone copy button component for use elsewhere
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '4px 10px',
        fontSize: '0.75rem',
        color: copied ? 'var(--success)' : 'var(--text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        transition: 'background 0.2s',
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
