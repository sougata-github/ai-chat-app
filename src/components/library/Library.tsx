/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { AnimatePresence } from "framer-motion";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type GalleryItem = {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: number;
};

function extractImagesFromMessage(message: Doc<"messages">): GalleryItem[] {
  const results: GalleryItem[] = [];
  const parts = Array.isArray(message.parts) ? message.parts : [];

  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    const type = part?.type;

    if (type === "tool-generateImageTool") {
      const { state, toolCallId } = part ?? {};
      if (state === "output-available") {
        const output = part?.output as
          | { imageUrl?: string; imageKey?: string; prompt: string }
          | undefined;

        if (output?.imageUrl) {
          results.push({
            id: `${message.id}-${toolCallId ?? index}`,
            imageUrl: output.imageUrl,
            prompt: output.prompt ?? "Untitled",
            createdAt: message.createdAt,
          });
        }
      }
    }
  }

  if (results.length === 0 && message.imageUrl) {
    results.push({
      id: message.id,
      imageUrl: message.imageUrl,
      prompt: "Generated Image",
      createdAt: message.createdAt,
    });
  }

  return results;
}

async function downloadImage(src: string) {
  const response = await fetch(src);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `generated-image-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleDateString();
  } catch {
    return "";
  }
}

const Library = () => {
  const messages = useQuery(api.chats.getMessagesWithImages, {});
  const isLoading = messages === undefined;

  const items = useMemo(() => {
    if (!messages) return [];
    const imgs = messages.flatMap(extractImagesFromMessage);
    return imgs.sort((a, b) => b.createdAt - a.createdAt);
  }, [messages]);

  const [active, setActive] = useState<GalleryItem | null>(null);

  return (
    <main className="w-full">
      <section className="px-4 md:px-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-pretty pb-4 pt-8">
          Your Generations
        </h1>
      </section>

      {isLoading && (
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
            "gap-2 px-4"
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="relative w-full">
              <Skeleton className="aspect-square rounded-none sm:w-full" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="px-4 md:px-6">
          <p className="text-muted-foreground">
            You do not have any generations yet
          </p>
        </div>
      )}

      {/* Image grid */}
      {!isLoading && items.length > 0 && (
        <motion.div
          className={cn(
            "grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 px-4 sm:px-6 gap-2"
          )}
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 1 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.06, delayChildren: 0.05 },
            },
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="relative w-full overflow-hidden">
              <button
                type="button"
                className="group relative block w-full aspect-square cursor-pointer"
                onClick={() => setActive(item)}
                aria-label="Open image"
              >
                <Image
                  src={item.imageUrl || "/placeholder.svg"}
                  alt={item.prompt}
                  fill
                  className="object-cover aspect-square"
                  priority={false}
                />

                <div className="hidden md:flex absolute inset-0 items-end justify-center p-4 bg-foreground/40 dark:bg-background/40 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-5 transition-all duration-200 text-center">
                  <div className="text-sm text-background dark:text-foreground">
                    <p className="font-medium">{item.prompt}</p>
                    <p className="text-xs text-background/60 dark:text-foreground/60">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {active && (
          <Dialog
            open={!!active}
            onOpenChange={(o: any) => !o && setActive(null)}
          >
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Generated Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative w-full aspect-square overflow-hidden bg-muted">
                  <Image
                    src={active.imageUrl || "/placeholder.svg"}
                    alt={active.prompt}
                    fill
                    sizes="(max-width: 768px) 100vw, 80vw"
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {active.prompt}
                    </p>
                  </div>
                  <Button onClick={() => downloadImage(active.imageUrl)}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Library;
