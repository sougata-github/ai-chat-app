"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { chatInputSchema } from "@/schemas";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ArrowUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ModelDropDown from "./ModelDropDown";
import React, {
  ChangeEvent,
  startTransition,
  useEffect,
  useOptimistic,
} from "react";
import { ChatRequestOptions } from "ai";
import { DEFAULT_MODEL_ID, ModelId } from "@/lib/model/model";
import { saveChatModelAsCookie } from "@/lib/model";
import ToolDropDown from "./ToolDropDown";
import { Tool, TOOL_REGISTRY } from "@/lib/tools/tool";
import { saveToolAsCookie } from "@/lib/tools";

interface Props {
  suggestion?: string;
  status?: "streaming" | "submitted" | "ready" | "error";
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onSubmitPrompt?: (prompt: string) => void;
  initialModel: ModelId;
  initialTool: Tool;
}

const ChatInput = ({
  status,
  input,
  setInput,
  handleSubmit,
  handleInputChange,
  onSubmitPrompt,
  initialModel,
  initialTool,
}: Props) => {
  const [optimisticTool, setOptimisticTool] = useOptimistic<Tool>(
    initialTool || "none"
  );

  const form = useForm<z.infer<typeof chatInputSchema>>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit = (values: z.infer<typeof chatInputSchema>) => {
    if (!values.prompt.trim()) return;

    if (onSubmitPrompt) {
      onSubmitPrompt(values.prompt);
    } else {
      const syntheticEvent = {
        preventDefault: () => {},
        target: { value: values.prompt },
      };

      setInput(values.prompt);
      handleSubmit(syntheticEvent);
    }
  };

  useEffect(() => {
    if (input.length > 0) {
      form.setFocus("prompt");
    }
  }, [input, form]);

  useEffect(() => {
    form.setValue("prompt", input);
  }, [input, form]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    form.setValue("prompt", e.target.value);
    handleInputChange(e);
  };

  const handleRemoveCurrentTool = () => {
    startTransition(async () => {
      setOptimisticTool("none");
      await saveToolAsCookie("none");
      await saveChatModelAsCookie(DEFAULT_MODEL_ID);
    });
  };

  const isTool = optimisticTool !== "none";
  const currentTool =
    optimisticTool === "none" ? null : TOOL_REGISTRY[optimisticTool];

  return (
    <div className={cn("sticky h-[auto] bottom-0 inset-x-0 z-20 w-full px-4")}>
      <div className="max-w-3xl mx-auto backdrop-blur-md relative">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <div className="rounded-t-xl dark:border dark:border-muted-foreground/10 border-b-0 dark:border-b-0 p-3 pb-0 dark:shadow-none shadow outline outline-muted-foreground/10">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem className="gap-0">
                    <FormControl>
                      <Textarea
                        className="w-full resize-none focus:ring-0 focus:outline-none max-h-32 
                        dark:border-1 dark:border-b-0 dark:border-muted-foreground/10 px-4 pt-4 pb-8 placeholder:text-muted-foreground rounded-b-none shadow-none max-md:placeholder:text-sm max-md:text-sm"
                        {...field}
                        placeholder="Type your message here..."
                        onChange={handleTextareaChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            form.handleSubmit(onSubmit)();
                          }
                        }}
                        disabled={status && status === "streaming"}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between py-2.5 px-3 dark:bg-muted-foreground/7.5 dark:border dark:border-muted-foreground/10 dark:border-y-0">
                <div className="flex items-center gap-1">
                  <ModelDropDown
                    initialModel={initialModel}
                    disabled={
                      isTool || status === "streaming" || status === "submitted"
                    }
                  />
                  <ToolDropDown
                    initialModel={initialModel}
                    optimisticTool={optimisticTool}
                    setOptimisticTool={setOptimisticTool}
                    disabledAll={
                      status === "streaming" || status === "submitted"
                    }
                  />

                  {optimisticTool &&
                    optimisticTool !== "none" &&
                    currentTool !== null && (
                      <Button
                        variant="secondary"
                        size="sm"
                        type="button"
                        className="rounded-full max-md:text-xs"
                        disabled={
                          status === "streaming" || status === "submitted"
                        }
                        onClick={handleRemoveCurrentTool}
                      >
                        {<currentTool.icon />}
                        <X className="size-3" />
                      </Button>
                    )}
                </div>

                <Button
                  variant="outline"
                  type="submit"
                  size="icon"
                  disabled={
                    !form.watch("prompt")?.trim().length ||
                    (status && status === "streaming")
                  }
                  className="rounded-full"
                >
                  <ArrowUp />
                  <span className="sr-only">Send message</span>
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
