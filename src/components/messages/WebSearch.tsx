"use client";

import { ArrowUpRightIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  publishedDate?: string;
}

interface WebSearchCardProps {
  results: WebSearchResult[];
  query: string;
}

const WebSearchCard = ({ results, query }: WebSearchCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div className="w-full pl-0 bg-transparent rounded-none transition min-h-[20px] mb-10">
      <div className="px-0">
        <div className="flex items-center text-base font-medium">
          Web Search Results
        </div>
        <div className="text-sm">
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
            <span className="text-xs sm:text-sm max-w-xs">
              Results for {query}
            </span>
          </Button>
        </div>
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
          <div className="flex flex-col gap-4 px-2 mt-4">
            {results.map((result, index) => (
              <Link key={index} href={`${result.url}`} target="_blank">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-sm line-clamp-1 flex-1">
                    {result.title}
                  </h4>
                  <ArrowUpRightIcon className="size-4 text-muted-foreground" />
                </div>

                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span className="truncate">
                    {new URL(result.url).hostname}
                  </span>{" "}
                  <span className="mx-1">|</span>{" "}
                  {result.publishedDate && (
                    <span>
                      {new Date(result.publishedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WebSearchCard;
