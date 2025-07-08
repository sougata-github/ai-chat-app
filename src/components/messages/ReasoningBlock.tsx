"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { ChevronDown, ChevronRight, Lightbulb } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "./MemoizedMarkdown";

interface Props {
  reasoning: string;
  isStreaming?: boolean;
}

const ReasoningBlock = ({ reasoning, isStreaming = false }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatReasoningSteps = (text: string) => {
    // Split reasoning into logical steps/paragraphs
    const steps = text.split("\n\n").filter((step) => step.trim());
    return steps;
  };

  const reasoningSteps = formatReasoningSteps(reasoning);

  return (
    <Card className="w-full bg-transparent dark:shadow-none border border-muted-foreground/15 rounded-lg px-4 shadow transition">
      <CardHeader className="px-0 border-b outline-muted-foreground/15">
        <div className="flex items-center text-base font-medium gap-2">
          <Lightbulb className="size-4" />
          {isStreaming ? (
            "Thinking"
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <span>Thought for some time</span>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-fit py-1 pl-0 h-auto text-xs text-muted-foreground hover:text-foreground rounded-sm hover:bg-transparent dark:hover:bg-transparent"
        >
          {isExpanded ? (
            <>
              <ChevronDown className="size-4" />
              Hide reasoning steps
            </>
          ) : (
            <>
              <ChevronRight className="size-4" />
              Show reasoning steps ({reasoningSteps.length} steps)
            </>
          )}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 px-0">
          <div className="space-y-3">
            {reasoningSteps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "px-4 py-1 dark:bg-muted-foreground/15 dark:outline-none dark:shadow-none shadow outline outline-muted-foreground/15 rounded-lg"
                )}
              >
                <MemoizedMarkdown
                  id={`reasoning-step-${index}`}
                  content={step.trim()}
                  className="text-sm leading-relaxed"
                />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ReasoningBlock;
