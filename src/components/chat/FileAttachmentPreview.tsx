"use client";

import { X, FileIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileAttachmentPreviewProps {
  fileName: string;
  fileType: "image" | "file";
  onDetach: () => void;
}

const FileAttachmentPreview = ({
  fileName,
  fileType,
  onDetach,
}: FileAttachmentPreviewProps) => {
  return (
    <div className="absolute -top-12 left-4 right-4 z-10">
      <div className="bg-muted/80 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 text-sm">
        {fileType === "image" ? (
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <FileIcon className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="flex-1 truncate text-muted-foreground">
          {fileName}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDetach}
          className="h-6 w-6 p-0 hover:bg-destructive/20"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default FileAttachmentPreview;
