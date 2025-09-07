"use client";

import { useEffect, startTransition, useState, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CreateUIMessage, FileUIPart, UIMessage } from "ai";
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
import { useLocalStorage } from "@/hooks/use-local-storage";
import { v4 as uuidv4 } from "uuid";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUsageStatus } from "@/hooks/use-usage-status";
import { motion } from "framer-motion";

interface Props {
  chatId: string;
  status?: "streaming" | "submitted" | "ready" | "error";
  input: string;
  setInput: (value: string) => void;
  createUserMessage: (
    message: UIMessage,
    fileKey: string | undefined
  ) => Promise<void>;
  handleInitialSubmit?: () => void;
  updateChat: () => void;
  isHomepageCentered?: boolean;
  sendMessage: (message: UIMessage | CreateUIMessage<UIMessage>) => void;
  setMessageToEdit: React.Dispatch<SetStateAction<Doc<"messages"> | null>>;
  messageToEdit: Doc<"messages"> | null;
  handleRegenerate: (() => Promise<void>) | undefined;
}

const ChatInput = ({
  chatId,
  status,
  input,
  setInput,
  createUserMessage,
  handleInitialSubmit,
  updateChat,
  isHomepageCentered = false,
  sendMessage,
  messageToEdit,
  setMessageToEdit,
  handleRegenerate,
}: Props) => {
  const [optimisticTool, setOptimisticTool] = useLocalStorage<Tool>(
    "chat-tool",
    "none"
  );

  const [optimisticModel, setOptimisticModel] = useLocalStorage<ModelId>(
    "chat-model",
    "gemini-2.5-flash"
  );

  const { canSend, isLoading } = useUsageStatus();

  const updateMessage = useMutation(api.chats.updateMessage);
  const createAttachment = useMutation(api.chats.createAttachment);

  const form = useForm<z.infer<typeof chatInputSchema>>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: {
      prompt: "",
    },
  });

  //file states
  const [isUploadingLongPrompt, setIsUploadingLongPrompt] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const isMobile = useIsMobile();

  useEffect(() => {
    form.setValue("prompt", input, { shouldDirty: true, shouldTouch: true });
    if (input.length > 0) {
      form.setFocus("prompt");
    }
  }, [input, form]);

  useEffect(() => {
    if (messageToEdit) {
      const text = messageToEdit.parts.find(
        (part: UIMessage["parts"][number]) => part.type === "text"
      ).text;

      if (text) {
        setInput(text);
        form.setValue("prompt", text, { shouldDirty: true });
      }

      if (messageToEdit.fileKey) {
        const file: FileUIPart = messageToEdit.parts.find(
          (part: UIMessage["parts"][number]) => part.type === "file"
        );

        if (file.filename) {
          form.setValue(
            "file",
            {
              name: file.filename,
              type: file.mediaType,
              url: file.url,
              key: messageToEdit.fileKey,
            },
            { shouldDirty: true }
          );
        }

        setOptimisticModel("gemini-2.5-flash");
        startTransition(async () => {
          await saveChatModelAsCookie("gemini-2.5-flash");
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageToEdit]);

  const handleSubmit = async (
    message: UIMessage,
    fileKey: string | undefined = undefined
  ) => {
    if (
      status === "streaming" ||
      status === "submitted" ||
      isUploadingFile ||
      isUploadingLongPrompt ||
      !canSend
    )
      return;

    if (messageToEdit) {
      let attachmentId: string | undefined = undefined;
      //create an attachment if currently there is a file in editing mode
      if (message.parts.some((part) => part.type === "file")) {
        if (fileKey !== undefined) {
          const fileAttachment = (message as UIMessage).parts?.find(
            (part) => part.type === "file"
          );

          if (
            fileAttachment &&
            fileAttachment.filename &&
            fileAttachment.url &&
            fileAttachment.type
          ) {
            const attachment = await createAttachment({
              id: uuidv4(),
              messageId: message.id,
              name: fileAttachment.filename,
              type: fileAttachment.mediaType,
              url: fileAttachment.url,
              key: fileKey,
              chatId,
            });
            attachmentId = attachment.uuid;
          }
        }
      }

      //updateMessage
      await updateMessage({
        messageId: messageToEdit.id,
        parts: message.parts,
        fileKey,
        attachmentId,
      });

      //regenerate response
      handleRegenerate?.();

      setMessageToEdit(null);
      form.reset();
      setInput("");
      updateChat();
      return;
    }

    sendMessage(message);
    handleInitialSubmit?.();
    await createUserMessage(message, fileKey);
    form.reset();
    setInput("");
    updateChat();
  };

  const onSubmit = async (values: z.infer<typeof chatInputSchema>) => {
    const trimmed = values.prompt?.trim() ?? "";
    const hasFile = !!values.file?.url;

    if (!trimmed && !hasFile) return;

    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

    if (hasFile && wordCount <= 0) {
      toast.error("Prompt has to be at least 2 characters long");
      return;
    }

    if (hasFile && wordCount >= 800) {
      toast.error("Prompt cannot exceed 800 words");
      return;
    }

    // file and prompt
    if (hasFile) {
      const message: UIMessage = {
        id: uuidv4(),
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
      handleSubmit(message, values.file?.key);
      return;
    }

    // just prompt
    const message: UIMessage = {
      id: uuidv4(),
      role: "user" as const,
      parts: [{ type: "text", text: trimmed }],
    };
    handleSubmit(message, undefined);
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

        setOptimisticModel("gemini-2.5-flash");
        startTransition(async () => {
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
    setOptimisticTool("none");
    setOptimisticModel("gemini-2.5-flash");
    startTransition(async () => {
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

    if (fileKey && fileKey.trim() !== "" && !messageToEdit) {
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
        "w-full px-4 z-20 rounded-b-2xl",
        isHomepageCentered
          ? "relative"
          : "sticky bottom-0 inset-x-0 pt-0 sm:hidden"
      )}
    >
      <div className="max-w-3xl mx-auto relative">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="relative pb-4"
          >
            {!canSend && !isLoading && (
              <motion.div
                className="rounded-md bg-destructive flex items-center p-2 text-sm dark:text-foreground text-background mb-4"
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                  },
                }}
              >
                You have reached your messages limit for today.
              </motion.div>
            )}
            {messageToEdit && (
              <div className="rounded-2xl rounded-b-none bg-background/80 flex justify-between p-2">
                <p className="text-sm">Editing Mode</p>
                <button
                  className="p-1 inline-flex items-center justify-center"
                  disabled={isUploadingFile || isUploadingLongPrompt}
                >
                  <X
                    className="size-4"
                    onClick={() => {
                      setMessageToEdit(null);
                      setInput("");
                      form.reset();
                    }}
                  />
                </button>
              </div>
            )}
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
                            if (!isMobile) {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                            }
                          }
                        }}
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
                    optimisticModel={optimisticModel}
                    setOptimisticModel={setOptimisticModel}
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
                  variant={"default"}
                  size="icon"
                  disabled={!canSubmit}
                  className="rounded-full border-none disabled:bg-muted-foreground/40"
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
