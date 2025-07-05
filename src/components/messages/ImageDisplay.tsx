"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Expand } from "lucide-react";
import Image from "next/image";

interface ImageDisplayProps {
  imageUrl: string;
  prompt: string;
}

const ImageDisplay = ({ imageUrl, prompt }: ImageDisplayProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  return (
    <div className="space-y-3 max-w-sm max-md:max-w-full">
      <div
        className="relative group cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted shadow-xs dark:shadow-none">
          <Image
            src={imageUrl}
            alt={prompt}
            fill
            quality={100}
            priority
            className="object-cover transition-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center max-sm:hidden">
            <Expand className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
          {prompt.at(0)?.toUpperCase() + prompt.slice(1)}
        </p>
        <Button variant="ghost" size="icon" onClick={handleDownload}>
          <Download />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Generated Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={imageUrl}
                alt={prompt}
                fill
                quality={100}
                priority
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground max-w-xs line-clamp-1">
                {prompt.at(0)?.toUpperCase() + prompt.slice(1)}
              </p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageDisplay;
