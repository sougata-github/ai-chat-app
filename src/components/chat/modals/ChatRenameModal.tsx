"use client";

import { Button } from "@/components/ui/button";

import ResponsiveModal from "./ResponsiveModal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { chatRenameSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { chatGetManyOutput } from "@/types";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  chat: chatGetManyOutput;
}

const ChatRenameModal = ({ open, onOpenChange, onCancel, chat }: Props) => {
  const form = useForm<z.infer<typeof chatRenameSchema>>({
    resolver: zodResolver(chatRenameSchema),
    defaultValues: {
      title: chat?.title ?? "",
    },
  });

  const rename = useMutation(api.chats.rename);
  const [isRenaming, setIsRenaming] = useState(false);

  const onSubmit = async (values: z.infer<typeof chatRenameSchema>) => {
    const { title } = values;
    if (chat) {
      try {
        setIsRenaming(true);
        await rename({ chatId: chat._id, title });
        toast.success("Chat Renamed");
        onCancel();
      } catch (error) {
        console.log((error as Error).message);
        toast.error("Failed to rename chat");
      } finally {
        setIsRenaming(false);
      }
    }
  };

  const onCancelForm = () => {
    onCancel();
  };

  return (
    <ResponsiveModal
      title="Rename Chat"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 max-md:p-5"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="gap-2">
                <FormLabel>Enter new chat title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="New Title"
                    className="placeholder:text-sm text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col md:flex-row items-centers md:justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full md:w-fit"
              onClick={onCancelForm}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full md:w-fit"
              disabled={isRenaming}
            >
              Rename
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};

export default ChatRenameModal;
