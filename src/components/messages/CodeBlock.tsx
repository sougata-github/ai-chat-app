/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import type React from "react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  materialLight,
  materialDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { Button } from "../ui/button";

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
  inline?: boolean;
  [key: string]: any;
}

const CodeBlock = ({ className = "", children, inline }: CodeBlockProps) => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const match = /language-(\w+)/.exec(className);
  const lang = match?.[1] ?? "text";
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(String(children)).catch(console.error);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <pre className="bg-muted-foreground/10 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono w-fit inline text-foreground">
        {children}
      </pre>
    );
  }

  return (
    <div className="my-4 w-full overflow-hidden rounded-lg border shadow-xs dark:shadow-none not-prose">
      <div className="flex items-center justify-between bg-muted px-4 py-1 text-xs text-muted-foreground border-b border-muted-foreground/10 rounded-t-md">
        <span className="font-medium text-sm">{lang}</span>
        <Button variant="ghost" size="icon" onClick={onCopy}>
          {copied ? <Check /> : <Copy />}{" "}
        </Button>
      </div>
      <div className="text-xs md:text-sm overflow-x-auto font-[--font-geist-mono]">
        <SyntaxHighlighter
          language={lang}
          style={isLight ? materialLight : materialDark}
          showLineNumbers={lang === "plaintext" ? false : true}
          customStyle={{
            margin: 0,
            whiteSpace: "pre",
            fontFamily: "var(--font-geist-mono), monospace",
          }}
          codeTagProps={{
            style: {
              whiteSpace: "pre",
              fontFamily: "inherit",
            },
          }}
          wrapLines={false}
          wrapLongLines={false}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
