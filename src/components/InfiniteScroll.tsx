"use client";

import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  isManual?: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

const InfiniteScroll = ({
  isManual = false, //for manually loading more data
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: Props) => {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [
    isIntersecting,
    hasNextPage,
    isFetchingNextPage,
    isManual,
    fetchNextPage,
  ]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={targetRef} className="h-1" />
      {hasNextPage ? (
        <Button
          variant="ghost"
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? (
            <Loader2 className="size-4 text-muted-foreground animate-spin transition-all" />
          ) : (
            "Load More"
          )}
        </Button>
      ) : (
        <></>
      )}
    </div>
  );
};

export default InfiniteScroll;
