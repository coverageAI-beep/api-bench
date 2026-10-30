import { marked } from 'marked';

// Configure marked with GitHub Flavored Markdown and line breaks
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Safely parses markdown content to HTML string.
 */
export function renderMarkdown(markdownText: string): string {
  if (!markdownText || !markdownText.trim()) return '';
  try {
    return marked.parse(markdownText, { async: false }) as string;
  } catch (err) {
    console.error('Failed to render markdown:', err);
    return markdownText;
  }
}
