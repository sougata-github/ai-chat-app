"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "../ui/card";
import { ChevronRight, Lightbulb } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "./MemoizedMarkdown";
import { SpinnerIcon } from "./SpinnerIcon";

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
    <Card className="w-full bg-transparent dark:shadow-none border border-muted-foreground/15 rounded-lg px-4 shadow transition min-h-[20px]">
      <CardHeader className="px-0 outline-muted-foreground/15">
        <div className="flex items-center text-base font-medium gap-2">
          {isStreaming ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="transition animate-spin">
                <SpinnerIcon />
              </div>
              <span>Thinking</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Lightbulb className="size-4" />
              <span>Thought for some time</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-fit py-1 pl-0 h-auto text-sm text-muted-foreground hover:text-foreground rounded-sm hover:bg-transparent dark:hover:bg-transparent"
        >
          <ChevronRight
            className={cn(
              "size-4 transition-transform duration-200 ease-in-out",
              isExpanded && "rotate-90"
            )}
          />
          {isExpanded ? (
            <>Hide reasoning steps</>
          ) : (
            <>Show reasoning steps ({reasoningSteps.length} steps)</>
          )}
        </Button>
      </CardHeader>

      {isExpanded && (
        <motion.div
          initial={{
            height: 0,
            opacity: 0,
            filter: "blur(4px)",
          }}
          animate={{
            height: "auto",
            opacity: 1,
            filter: "blur(0px)",
          }}
          transition={{
            height: {
              duration: 0.2,
              ease: [0.04, 0.62, 0.23, 0.98],
            },
            opacity: {
              duration: 0.25,
              ease: "easeInOut",
            },
            filter: {
              duration: 0.2,
              ease: "easeInOut",
            },
          }}
          style={{ overflow: "hidden" }}
        >
          <CardContent className="p-2">
            <motion.div
              className="space-y-3"
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              exit={{ y: -10 }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
            >
              {reasoningSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  className={cn(
                    "px-4 py-3 dark:bg-muted-foreground/15 dark:outline-none dark:shadow-none shadow rounded-lg outline outline-muted-foreground/10"
                  )}
                >
                  <MemoizedMarkdown
                    id={`reasoning-step-${index}`}
                    content={step.trim()}
                    className="text-sm leading-relaxed"
                  />
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </motion.div>
      )}
    </Card>
  );
};

export default ReasoningBlock;
