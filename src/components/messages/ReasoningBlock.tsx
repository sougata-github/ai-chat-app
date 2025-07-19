"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
    <div className="w-full pl-0 bg-transparent rounded-none transition min-h-[20px] mb-10">
      <div className="px-0">
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
          className="w-fit py-1 pl-0 h-auto text-sm text-muted-foreground hover:text-foreground rounded-sm hover:bg-transparent dark:hover:bg-transparent mt-1"
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
      </div>

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
          <div className="mt-4 border-l border-muted-foreground/20 p-2">
            <div>
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
                  className={cn("px-4 py-2")}
                >
                  <MemoizedMarkdown
                    id={`reasoning-step-${index}`}
                    content={step.trim()}
                    className="text-sm leading-relaxed italic"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReasoningBlock;
