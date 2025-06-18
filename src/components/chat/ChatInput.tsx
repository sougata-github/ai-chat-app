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
import { ArrowUp, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ModelDropDown from "./ModelDropDown";

interface Props {
  variant: "message" | "chat";
  chatId?: string;
  suggestion?: string;
}

const ChatInput = ({ suggestion }: Props) => {
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
    <div className={cn("sticky bottom-0 inset-x-0 z-20 w-full px-4")}>
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
                      />
                    </FormControl>
                    <FormMessage className="dark:bg-muted-foreground/7.5 dark:border dark:border-muted-foreground/10 dark:border-y-0 p-2" />
                  </FormItem>
                )}
              />
              <div className="flex items-center justify-between py-2.5 px-3 dark:bg-muted-foreground/7.5 dark:border dark:border-muted-foreground/10 dark:border-y-0">
                <div className="flex items-center gap-1">
                  <ModelDropDown />
                  <Button
                    variant="ghost"
                    type="button"
                    size="icon"
                    className={cn(
                      "rounded-full bg-transparent"
                      // image-gen selected && "some-bg"
                    )}
                  >
                    <ImageIcon />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  type="submit"
                  size="icon"
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
