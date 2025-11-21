"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Lightbulb } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { MemoizedMarkdown } from "./MemoizedMarkdown";
import { SpinnerIcon } from "./SpinnerIcon";

interface Props {
  reasoningText: string;
  isStreaming?: boolean;
}

const ReasoningBlock = ({ reasoningText, isStreaming = false }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatReasoningSteps = (text: string) => {
    // split reasoning into logical steps/paragraphs
    const steps = text.split("\n\n").filter((step) => step.trim());
    return steps;
  };

  const reasoningSteps = formatReasoningSteps(reasoningText);

  return (
    <motion.div className="w-full pl-0 bg-transparent rounded-none transition min-h-[20px] mb-10">
      <div className="px-0">
        <div className="flex items-center text-sm font-medium gap-2">
          {isStreaming ? (
            <div className="flex items-center gap-2">
              <div className="transition animate-spin">
                <SpinnerIcon />
              </div>
              <span>Thinking</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Lightbulb className="size-4" />
              <span>Thought for some time</span>
            </div>
          )}
        </div>

        <div className="text-sm flex items-start mt-1 gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-fit py-0.5 pl-0 h-auto text-sm text-muted-foreground hover:text-foreground rounded-sm hover:bg-transparent dark:hover:bg-transparent"
          >
            <ChevronRight
              className={cn(
                "size-4 transition-transform duration-200 ease-in-out max-sm:-mt-[1.8px]",
                isExpanded && "rotate-90"
              )}
            />
          </Button>
          <span
            className="text-xs sm:text-sm text-muted-foreground"
            onClick={() => setIsExpanded(!isExpanded)}
            role="button"
          >
            {isExpanded ? "Hide reasoning steps" : "Show reasoning steps"}
          </span>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{
            height: 0,
            opacity: 0,
          }}
          animate={{
            height: "auto",
            opacity: 1,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: {
              duration: 0.5,
              ease: "easeInOut",
            },
          }}
          style={{ overflow: "hidden" }}
        >
          <div className="mt-2 p-2 pl-0">
            <div>
              {reasoningSteps.map((step, index) => (
                <div key={index} className={cn("px-4 py-2")}>
                  <MemoizedMarkdown
                    id={`reasoning-step-${index}`}
                    content={step.trim()}
                    className="text-sm leading-relaxed italic text-muted-foreground"
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReasoningBlock;
