import { useState, useCallback, useRef } from 'react';
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlockView({ node, updateAttributes, extension }: NodeViewProps) {
  const [copied, setCopied] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const language = node.attrs.language || extension.options.defaultLanguage || 'plaintext';

  const handleCopy = useCallback(() => {
    const text = wrapperRef.current?.querySelector('pre code')?.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const handleLanguageChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateAttributes({ language: e.target.value });
    },
    [updateAttributes]
  );

  return (
    <NodeViewWrapper className="code-block-node" ref={wrapperRef}>
      <div className="code-block-header">
        <select
          contentEditable={false}
          className="code-lang-select"
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="plaintext">plaintext</option>
          <option value="javascript">javascript</option>
          <option value="typescript">typescript</option>
          <option value="python">python</option>
          <option value="rust">rust</option>
          <option value="go">go</option>
          <option value="java">java</option>
          <option value="cpp">c++</option>
          <option value="csharp">c#</option>
          <option value="php">php</option>
          <option value="ruby">ruby</option>
          <option value="swift">swift</option>
          <option value="kotlin">kotlin</option>
          <option value="sql">sql</option>
          <option value="bash">bash</option>
          <option value="shell">shell</option>
          <option value="yaml">yaml</option>
          <option value="json">json</option>
          <option value="html">html</option>
          <option value="xml">xml</option>
          <option value="css">css</option>
          <option value="scss">scss</option>
          <option value="markdown">markdown</option>
          <option value="dockerfile">dockerfile</option>
          <option value="nginx">nginx</option>
          <option value="lua">lua</option>
          <option value="perl">perl</option>
          <option value="r">r</option>
          <option value="scala">scala</option>
          <option value="haskell">haskell</option>
          <option value="elixir">elixir</option>
          <option value="erlang">erlang</option>
          <option value="clojure">clojure</option>
          <option value="powershell">powershell</option>
          <option value="vim">vim</option>
          <option value="diff">diff</option>
          <option value="ini">ini</option>
          <option value="makefile">makefile</option>
        </select>

        <button
          contentEditable={false}
          className={`code-copy-btn ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      <pre>
        <NodeViewContent as={'code' as any} className={`language-${language}`} />
      </pre>
    </NodeViewWrapper>
  );
}
