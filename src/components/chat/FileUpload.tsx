"use client";

import type React from "react";

import { startTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, ImageIcon, FileIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { uploadFiles } from "@/lib/upload/uploadthing";
import { saveChatModelAsCookie } from "@/lib/model";
import type z from "zod";
import type { ModelId } from "@/lib/model/model";
import type { chatInputSchema } from "@/schemas";

type FileValue = z.infer<typeof chatInputSchema.shape.file>;

interface FileUploadProps {
  setOptimisticModel: (model: ModelId) => void;
  onChange: (file: FileValue) => void;
  disabled?: boolean;
  setIsUploadingFile: (uploading: boolean) => void;
}

const FileUpload = ({
  setOptimisticModel,
  onChange,
  disabled = false,
  setIsUploadingFile,
}: FileUploadProps) => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const doUpload = async (
    pickedFile: File,
    endpoint: "imageUploader" | "fileUploader"
  ) => {
    try {
      setIsUploadingFile(true);

      const res = await uploadFiles(endpoint, {
        files: [pickedFile],
      });

      const payload = Array.isArray(res) ? res[0] : undefined;

      const serverData = payload?.serverData ?? payload;

      const url: string | undefined = serverData?.url ?? serverData?.url;
      const key: string | undefined = serverData?.key;
      const name: string | undefined = serverData?.name ?? pickedFile.name;
      const type: string | undefined = serverData?.type ?? pickedFile.type;

      if (!url || !key || !type) {
        throw new Error("Upload response missing required fields.");
      }

      onChange({
        url,
        key,
        name: name || pickedFile.name,
        type,
      });

      startTransition(async () => {
        setOptimisticModel("gemini-2.5-flash");
        await saveChatModelAsCookie("gemini-2.5-flash");
      });

      toast.success(
        `${
          endpoint === "fileUploader" ? "File" : "Image"
        } uploaded successfully`
      );

      setIsUploadingFile(false);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(
        `Upload failed: ${(error as Error)?.message ?? "Unknown error"}`
      );

      setIsUploadingFile(false);
    }
  };

  const handleImagePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      toast.error("Max size is 4MB.");
      return;
    }

    await doUpload(f, "imageUploader");
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(f.type)) {
      toast.error("Only PDF or TXT files are allowed.");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      toast.error("Max size is 4MB.");
      return;
    }

    await doUpload(f, "fileUploader");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="rounded-full"
            disabled={disabled}
          >
            <Paperclip className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" align="start">
          <DropdownMenuItem
            onClick={handleImageClick}
            className="cursor-pointer"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Add Image
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleFileClick}
            className="cursor-pointer"
          >
            <FileIcon className="size-4 mr-2" />
            Add File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImagePicked}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,text/plain"
        className="hidden"
        onChange={handleFilePicked}
      />
    </>
  );
};

export default FileUpload;
