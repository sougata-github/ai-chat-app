/* eslint-disable @typescript-eslint/no-explicit-any */
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
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  p: ({ node, children, ...props }) => {
    const isOnlyText = node?.children.every(
      (child: any) => child.type === "text"
    );

    if (!isOnlyText) {
      return <div {...props}>{children}</div>;
    }

    return (
      <p {...props} className="py-0.5 text-sm md:text-base">
        {children}
      </p>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li {...props} className="text-sm sm:text-base">
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-disc list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-expect-error
      <Link
        className="text-blue-500 hover:underline text-sm"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-xl md:text-2xl font-semibold my-4" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-lg md:text-xl font-semibold my-4" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-lg font-semibold my-4" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-sm md:text-base font-semibold my-4" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-sm font-semibold my-4" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold my-4" {...props}>
        {children}
      </h6>
    );
  },
  blockquote: ({ node, children, ...props }) => {
    return (
      <blockquote
        className="border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground my-4"
        {...props}
      >
        {children}
      </blockquote>
    );
  },
  hr: ({ node, ...props }) => {
    return <hr className="my-8 border-muted-foreground/20 h-0.5" {...props} />;
  },
  table: ({ node, children, ...props }) => {
    return (
      <div className="overflow-x-auto my-4 p-4 rounded-xl border">
        <table className="min-w-full" {...props}>
          {children}
        </table>
      </div>
    );
  },
  th: ({ node, children, ...props }) => {
    return (
      <th
        className="border-b px-4 py-2.5 font-semibold text-left text-sm"
        {...props}
      >
        {children}
      </th>
    );
  },
  tr: ({ node, children, ...props }) => {
    return (
      <tr className="border-b last:border-0" {...props}>
        {children}
      </tr>
    );
  },
  td: ({ node, children, ...props }) => {
    return (
      <td className="px-4 py-2 text-sm" {...props}>
        {children}
      </td>
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
      <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
    ));
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
