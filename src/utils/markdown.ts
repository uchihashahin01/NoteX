import TurndownService from 'turndown';
import Showdown from 'showdown';

// Showdown: Markdown -> HTML
const showdownConverter = new Showdown.Converter({
  tables: true,
  tasklists: true,
  strikethrough: true,
  ghCodeBlocks: true,
  simplifiedAutoLink: true,
  literalMidWordUnderscores: true,
  simpleLineBreaks: false,
  headerLevelStart: 1,
  ghCompatibleHeaderId: true,
});

// Turndown: HTML -> Markdown
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  bulletListMarker: '-',
  hr: '---',
});

// Custom rule for task lists
turndownService.addRule('taskListItem', {
  filter: (node) => {
    return (
      node.nodeName === 'LI' &&
      (node.getAttribute('data-checked') === 'true' ||
        node.getAttribute('data-checked') === 'false')
    );
  },
  replacement: (_content, node) => {
    const checked = (node as HTMLElement).getAttribute('data-checked') === 'true';
    const p = (node as HTMLElement).querySelector('p');
    const text = p ? p.textContent || '' : (node as HTMLElement).textContent || '';
    return `- [${checked ? 'x' : ' '}] ${text.trim()}\n`;
  },
});

// Custom rule for task list UL (just pass through children)
turndownService.addRule('taskList', {
  filter: (node) => {
    return (
      node.nodeName === 'UL' &&
      node.getAttribute('data-type') === 'taskList'
    );
  },
  replacement: (content) => content,
});

// Custom rule for highlight marks
turndownService.addRule('highlight', {
  filter: 'mark',
  replacement: (content) => `==${content}==`,
});

// Custom rule to handle code blocks properly (preserve language class)
turndownService.addRule('codeBlock', {
  filter: (node) => {
    return node.nodeName === 'PRE' && !!node.querySelector('code');
  },
  replacement: (_content, node) => {
    const code = (node as HTMLElement).querySelector('code');
    if (!code) return _content;
    const langMatch = code.className.match(/language-(\S+)/);
    const lang = langMatch ? langMatch[1] : '';
    const text = code.textContent || '';
    return `\n\`\`\`${lang}\n${text}\n\`\`\`\n`;
  },
});

export function markdownToHtml(md: string): string {
  // Handle highlight syntax ==text== before conversion
  let processed = md.replace(/==(.*?)==/g, '<mark>$1</mark>');
  
  // Handle task lists for TipTap format
  processed = processed.replace(
    /^- \[(x| )\]\s+(.+)$/gm,
    (_match, checked, text) => {
      const isChecked = checked === 'x';
      return `<ul data-type="taskList"><li data-checked="${isChecked}"><label><input type="checkbox"${isChecked ? ' checked' : ''}><span></span></label><div><p>${text}</p></div></li></ul>`;
    }
  );
  
  // Remove the task list lines before passing to showdown (already converted)
  const taskListBlocks: string[] = [];
  processed = processed.replace(/<ul data-type="taskList">.*?<\/ul>/g, (match) => {
    const idx = taskListBlocks.length;
    taskListBlocks.push(match);
    return `<!--TASKLIST_${idx}-->`;
  });

  let html = showdownConverter.makeHtml(processed);
  
  // Restore task lists
  taskListBlocks.forEach((block, idx) => {
    html = html.replace(`<!--TASKLIST_${idx}-->`, block);
    // Also handle wrapped in <p> tags
    html = html.replace(`<p><!--TASKLIST_${idx}--></p>`, block);
  });

  return html;
}

export function htmlToMarkdown(html: string): string {
  let md = turndownService.turndown(html);

  // Clean up extra newlines
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim() + '\n';

  return md;
}
