"use client";

import { useEffect, startTransition, useOptimistic, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ChatRequestOptions, CreateUIMessage, UIMessage } from "ai";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ArrowUp, FileIcon, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ModelDropDown from "./ModelDropDown";
import ToolDropDown from "./ToolDropDown";
import { chatInputSchema } from "@/schemas";
import { DEFAULT_MODEL_ID, type ModelId } from "@/lib/model/model";
import { saveChatModelAsCookie } from "@/lib/model";
import { type Tool, TOOL_REGISTRY } from "@/lib/tools/tool";
import { saveToolAsCookie } from "@/lib/tools";
import { deletedAttachedFile, uploadTextFile } from "@/lib/upload";
import { toast } from "sonner";
import FileUpload from "./FileUpload";
import { SpinnerIcon } from "../messages/SpinnerIcon";

interface Props {
  suggestion?: string;
  status?: "streaming" | "submitted" | "ready" | "error";
  input: string;
  setInput: (value: string) => void;
  handleInitialSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  initialModel: ModelId;
  initialTool: Tool;
  isHomepageCentered?: boolean;
  sendMessage: (message: UIMessage | CreateUIMessage<UIMessage>) => void;
}

const ChatInput = ({
  status,
  input,
  setInput,
  handleInitialSubmit,
  initialModel,
  initialTool,
  isHomepageCentered = false,
  sendMessage,
}: Props) => {
  const [optimisticTool, setOptimisticTool] = useOptimistic<Tool>(
    initialTool || "none"
  );
  const [optimisticModel, setOptimisticModel] = useOptimistic<ModelId>(
    initialModel || "gemini-2.5-flash"
  );

  const form = useForm<z.infer<typeof chatInputSchema>>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: {
      prompt: "",
    },
  });

  //file states
  const [isUploadingLongPrompt, setIsUploadingLongPrompt] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  useEffect(() => {
    form.setValue("prompt", input, { shouldDirty: true, shouldTouch: true });
    if (input.length > 0) {
      form.setFocus("prompt");
    }
  }, [input, form]);

  const handleSubmit = async (message: CreateUIMessage<UIMessage>) => {
    handleInitialSubmit();

    sendMessage(message);

    form.reset();
    setInput("");
  };

  const onSubmit = async (values: z.infer<typeof chatInputSchema>) => {
    const trimmed = values.prompt?.trim() ?? "";
    const hasFile = !!values.file?.url;

    if (!trimmed && !hasFile) return;

    if (!hasFile && trimmed.length < 2) {
      toast.error("Prompt has to be at least 2 characters long");
      return;
    }

    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

    if (hasFile && wordCount >= 800) {
      toast.error("Prompt cannot exceed 800 words");
      return;
    }

    // file and prompt
    if (hasFile) {
      const message: CreateUIMessage<UIMessage> = {
        role: "user" as const,
        parts: [
          {
            type: "file",
            url: values.file!.url!,
            mediaType: values.file!.type!,
            filename: values.file!.name!,
          },
          {
            type: "text",
            text: trimmed,
          },
        ],
        metadata: {
          fileKey: values.file?.key,
        },
      };
      handleSubmit(message);
      return;
    }

    // just prompt
    const message: CreateUIMessage<UIMessage> = {
      role: "user" as const,
      parts: [{ type: "text", text: trimmed }],
    };
    handleSubmit(message);
  };

  const handleTextareaChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    form.setValue("prompt", value, { shouldDirty: true });
    setInput(value);

    const trimmed = value.trim();
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    const hasFile = !!form.getValues("file")?.url;

    const isLong = wordCount >= 800;

    //upload long prompt as text file
    if (!hasFile && isLong && !isUploadingLongPrompt) {
      try {
        form.setValue("prompt", "", { shouldDirty: true, shouldTouch: true });
        setInput("");

        setIsUploadingLongPrompt(true);
        toast.success("Uploading your prompt as text file...");

        const blob = new Blob([trimmed], { type: "text/plain" });
        const textFile = new File([blob], "long-prompt.txt", {
          type: "text/plain",
        });

        const uploadResult = await uploadTextFile(textFile);
        const url = uploadResult?.[0]?.data?.ufsUrl;
        const key = uploadResult?.[0]?.data?.key ?? "";

        if (!url) {
          toast.error("Could not upload the prompt file, please try again.");
          return;
        }

        form.setValue(
          "file",
          {
            name: "long-prompt.txt",
            url,
            key,
            type: "text/plain",
          },
          { shouldDirty: true }
        );

        startTransition(async () => {
          setOptimisticModel("gemini-2.5-flash");
          await saveChatModelAsCookie("gemini-2.5-flash");
        });

        toast.success("Prompt uploaded as text file");
      } catch (error) {
        console.error("Error uploading long prompt:", error);
        toast.error("Upload failed. Please try again.");
      } finally {
        setIsUploadingLongPrompt(false);
      }
    }
  };

  const handleRemoveCurrentTool = () => {
    startTransition(async () => {
      setOptimisticTool("none");
      await saveToolAsCookie("none");
      await saveChatModelAsCookie(DEFAULT_MODEL_ID);
    });
  };

  const handleDetachFile = async () => {
    const fileKey = form.getValues("file.key");
    form.setValue("file", {
      name: "",
      url: "",
      key: "",
      type: "",
    });

    setIsUploadingFile(false);

    if (fileKey && fileKey.trim() !== "") {
      try {
        await deletedAttachedFile(fileKey);
        toast.success("File removed");
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const isDisabled =
    status === "streaming" ||
    status === "submitted" ||
    isUploadingLongPrompt ||
    isUploadingFile;
  const isTool = optimisticTool !== "none";
  const currentTool = isTool ? TOOL_REGISTRY[optimisticTool] : null;

  const watchedFile = form.watch("file");
  const hasFile = !!watchedFile?.url;
  const isImageFile = watchedFile?.type?.startsWith("image");
  const fileName = watchedFile?.name;

  const canSubmit =
    (!!form.watch("prompt")?.trim().length || hasFile) && !isDisabled;

  return (
    <div
      className={cn(
        "w-full px-4 z-20 bg-background rounded-b-2xl",
        isHomepageCentered ? "relative" : "sticky bottom-0 inset-x-0 pt-0"
      )}
    >
      <div className="max-w-3xl mx-auto relative">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="relative pb-4"
          >
            <div className="rounded-2xl outline-2 outline-muted-foreground/10 shadow-xs dark:shadow-none bg-background/80">
              {(hasFile || isUploadingLongPrompt || isUploadingFile) && (
                <div className="flex items-center p-2 pb-0 rounded-t-2xl w-full dark:bg-muted-foreground/7.5">
                  {isImageFile ? (
                    <ImageIcon className="size-4 text-muted-foreground" />
                  ) : (
                    <FileIcon className="size-4 text-muted-foreground" />
                  )}
                  {isUploadingLongPrompt || isUploadingFile ? (
                    <span className="mx-2 text-sm">
                      <div className="animate-spin">
                        <SpinnerIcon size={12} />
                      </div>
                    </span>
                  ) : (
                    <span className="mx-2 text-sm truncate text-muted-foreground">
                      {fileName}
                    </span>
                  )}
                  {!isUploadingFile && !isUploadingLongPrompt && (
                    <button
                      type="button"
                      onClick={handleDetachFile}
                      disabled={isDisabled}
                      className="rounded-full p-1 disabled:text-muted-foreground/5"
                      aria-label="Remove attached file"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem className="gap-0">
                    <FormControl>
                      <Textarea
                        className={cn(
                          "w-full resize-none focus:ring-0 focus:outline-none max-h-32 border-0 px-4 pb-8 placeholder:text-muted-foreground shadow-none placeholder:text-sm text-sm sm:text-base rounded-t-2xl sm:disabled:min-h-18 pt-4",
                          (hasFile ||
                            isUploadingLongPrompt ||
                            isUploadingFile) &&
                            "rounded-t-none"
                        )}
                        {...field}
                        value={input}
                        placeholder="Type your message here..."
                        onChange={handleTextareaChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                        disabled={isDisabled}
                        aria-label="Chat prompt"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between py-2.5 px-3 rounded-b-2xl dark:bg-muted-foreground/7.5">
                <div className="flex items-center gap-1">
                  <ModelDropDown
                    optimisticModel={optimisticModel}
                    setOptimisticModel={setOptimisticModel}
                    currentTool={optimisticTool}
                    disabled={isTool || isDisabled || hasFile}
                  />
                  <ToolDropDown
                    setOptimisticModel={setOptimisticModel}
                    initialModel={initialModel}
                    optimisticTool={optimisticTool}
                    setOptimisticTool={setOptimisticTool}
                    disabledAll={isDisabled || hasFile}
                  />
                  {currentTool && optimisticTool !== "none" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      className="rounded-full max-md:text-xs"
                      disabled={isDisabled}
                      onClick={handleRemoveCurrentTool}
                    >
                      {<currentTool.icon />}
                      <X className="size-3" />
                    </Button>
                  )}
                  <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                      <FormItem>
                        <FileUpload
                          setOptimisticModel={setOptimisticModel}
                          onChange={field.onChange}
                          disabled={isDisabled || isTool || hasFile}
                          setIsUploadingFile={setIsUploadingFile}
                        />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  size="icon"
                  disabled={!canSubmit}
                  className="rounded-full bg-muted-foreground/20 text-foreground border-none"
                  aria-label="Send message"
                >
                  <ArrowUp />
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ChatInput;
