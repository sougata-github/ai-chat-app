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
}

const CodeBlock = ({ className = "", children }: CodeBlockProps) => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const match = /language-(\w+)/.exec(className);
  const lang = match?.[1] ?? "plaintext";

  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(String(children)).catch(console.error);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl border overflow-hidden shadow-xs dark:shadow-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-muted px-4 py-2 text-xs text-muted-foreground border-b">
        <span className="capitalize font-medium">{lang}</span>
        <Button variant="ghost" size="sm" onClick={onCopy}>
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={lang}
          style={isLight ? materialLight : materialDark}
          showLineNumbers
          wrapLines={false}
          customStyle={{
            overflow: "auto",
            margin: 0,
          }}
          codeTagProps={{
            style: {},
          }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
