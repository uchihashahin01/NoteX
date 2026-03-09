// Simple MD -> HTML and HTML -> MD conversion for TipTap
// We keep it lightweight - TipTap handles the rich editing, we just need to serialize/deserialize

export function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks (must be before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = escapeHtml(code.trimEnd());
    return `<pre><code class="language-${lang || 'plaintext'}">${escaped}</code></pre>`;
  });

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');

  // Bold + Italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Task lists
  html = html.replace(
    /^- \[x\]\s+(.+)$/gm,
    '<ul data-type="taskList"><li data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>$1</p></div></li></ul>'
  );
  html = html.replace(
    /^- \[ \]\s+(.+)$/gm,
    '<ul data-type="taskList"><li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>$1</p></div></li></ul>'
  );

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  // Unordered lists
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Paragraphs - wrap remaining text
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<hr') ||
        trimmed.startsWith('<img') ||
        trimmed.startsWith('<li')
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}

export function htmlToMarkdown(html: string): string {
  let md = html;

  // Code blocks
  md = md.replace(
    /<pre><code(?:\s+class="language-(\w+)")?>([\s\S]*?)<\/code><\/pre>/g,
    (_match, lang, code) => {
      return `\`\`\`${lang || ''}\n${unescapeHtml(code)}\n\`\`\``;
    }
  );

  // Headers
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/g, '#### $1');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/g, '##### $1');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/g, '###### $1');

  // Horizontal rule
  md = md.replace(/<hr\s*\/?>/g, '---');

  // Bold / Italic
  md = md.replace(/<strong><em>(.*?)<\/em><\/strong>/g, '***$1***');
  md = md.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/g, '*$1*');

  // Strikethrough
  md = md.replace(/<s>(.*?)<\/s>/g, '~~$1~~');

  // Underline (no md equiv, just strip)
  md = md.replace(/<u>(.*?)<\/u>/g, '$1');

  // Highlight
  md = md.replace(/<mark>(.*?)<\/mark>/g, '==$1==');

  // Inline code
  md = md.replace(/<code>(.*?)<\/code>/g, '`$1`');

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/g, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/g, '![]($1)');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)');

  // Task lists
  md = md.replace(
    /<ul data-type="taskList">[\s\S]*?<li data-checked="true"[^>]*>[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<\/li>[\s\S]*?<\/ul>/g,
    '- [x] $1'
  );
  md = md.replace(
    /<ul data-type="taskList">[\s\S]*?<li data-checked="false"[^>]*>[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<\/li>[\s\S]*?<\/ul>/g,
    '- [ ] $1'
  );

  // Blockquotes
  md = md.replace(/<blockquote>[\s\S]*?<p>(.*?)<\/p>[\s\S]*?<\/blockquote>/g, '> $1');

  // List items
  md = md.replace(/<li[^>]*><p>(.*?)<\/p><\/li>/g, '- $1');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/g, '- $1');

  // Remove list wrappers
  md = md.replace(/<\/?[uo]l[^>]*>/g, '');

  // Paragraphs
  md = md.replace(/<p>(.*?)<\/p>/g, '$1\n');

  // Line breaks
  md = md.replace(/<br\s*\/?>/g, '\n');

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Unescape HTML entities
  md = unescapeHtml(md);

  // Clean up extra newlines
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim() + '\n';

  return md;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function unescapeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
