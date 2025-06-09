"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Textarea } from "../ui/textarea";
import { ArrowUp } from "lucide-react";

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt must be at least 1 character.",
  }),
});

export function PromptForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <div className="mt-8 flex flex-col rounded-lg border p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Start asking questions."
                    {...field}
                    className="max-w-2xl border-none p-1"
                    cols={100}
                  />
                </FormControl>
                <FormMessage />
                <Button size="icon" variant="outline">
                  <ArrowUp />
                </Button>
              </FormItem>
            )}
          />
        </form>
      </div>
    </Form>
  );
}
