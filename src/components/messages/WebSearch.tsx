"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoizedMarkdown } from "./MemoizedMarkdown";

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
  return (
    <Card className="w-full bg-transparent shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          Web Search Results
        </CardTitle>
        <CardDescription>
          Found {results.length} results for {query}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className="dark:bg-muted-foreground/15 dark:outline-none dark:shadow-nonw shadow outline outline-muted-foreground/15 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm line-clamp-2 flex-1">
                {result.title}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => window.open(result.url, "_blank")}
              >
                <ExternalLink className="size-4" />
              </Button>
            </div>

            <div className="text-sm text-muted-foreground line-clamp-5">
              <MemoizedMarkdown id={result.url} content={result.content} />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate">{new URL(result.url).hostname}</span>
              {result.publishedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(result.publishedDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WebSearchCard;
