"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { chatInputSchema } from "@/schemas";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "../ui/sidebar";

interface Props {
  variant: "message" | "chat";
  chatId?: string;
  suggestion?: string;
}

const ChatInput = ({ variant = "chat", chatId, suggestion }: Props) => {
  const { state, isMobile } = useSidebar();

  const form = useForm<z.infer<typeof chatInputSchema>>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: {
      prompt: suggestion ?? "",
    },
  });

  const onSubmit = (values: z.infer<typeof chatInputSchema>) => {
    //depending on the variant, perform the mutation
    //variant === "chat" then chat.create (no chatId) else message.create (with ChatId)
    console.log(values);
  };

  return (
    <div
      className={cn(
        "max-w-2xl mx-auto fixed bottom-0 left-[calc(50%+8rem)] -translate-x-1/2 w-full z-20 bg-transparent p-2.5 pb-0 pointer-events-none"
      )}
      style={{
        left: state === "collapsed" && !isMobile ? "50%" : "calc(50%+8rem)",
      }}
    >
      <div className="max-w-3xl mx-auto backdrop-blur-md ">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <div className="relative dark:bg-muted-foreground/5 rounded-t-xl dark:border dark:border-muted-foreground/10 border-b-0 dark:border-b-0 overflow-hidden p-3 pb-0 dark:shadow-none shadow">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        className="w-full h-24 resize-none bg-transparent focus:ring-0 focus:outline-none dark:border-1 dark:border-b-0 dark:border-muted-foreground/10 px-4 pt-3 placeholder:text-muted-foreground rounded-b-none shadow-none max-md:placeholder:text-sm max-md:text-sm"
                        {...field}
                        placeholder="Type your message here..."
                      />
                    </FormControl>
                    <FormMessage className="bg-transparent pb-2 absolute bottom-1 left-6 right-0" />
                  </FormItem>
                )}
              />
              <div className="absolute bottom-2 right-6">
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-md bg-muted-foreground/10 hover:bg-muted-foreground/5 text-muted-foreground"
                >
                  <ArrowUp />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>
          </form>
        </Form>
        {/* 
      image-gen mode button and model choose dropdown */}
      </div>
    </div>
  );
};

export default ChatInput;
