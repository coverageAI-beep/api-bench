import React, { useMemo } from 'react';
import { renderMarkdown } from '../lib/markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  fallbackText?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  fallbackText = 'No description provided.',
}) => {
  const html = useMemo(() => {
    if (!content || !content.trim()) return '';
    return renderMarkdown(content);
  }, [content]);

  if (!html) {
    return (
      <div className="text-xs text-[#78716C] italic font-sans py-1">
        {fallbackText}
      </div>
    );
  }

  return (
    <div
      className={`markdown-content text-xs text-[#292524] font-sans ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
