/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */

"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import React, { memo, useMemo } from "react";
import { marked } from "marked";
import CodeBlock from "./CodeBlock";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens
    .map((token) => token.raw ?? "")
    .filter((block) => block.trim().length > 0);
}

const components: Partial<Components> = {
  // @ts-expect-error
  code: CodeBlock,
  pre: ({ children }) => <>{children}</>,
  table: ({ node, children, ...props }) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full" {...props}>
          {children}
        </table>
      </div>
    );
  },
};

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.content !== nextProps.content) return false;
    return true;
  }
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return blocks.map((block, index) => (
      <div className="content-styles" key={`${id}-block_${index}`}>
        <MemoizedMarkdownBlock content={block} />
      </div>
    ));
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
