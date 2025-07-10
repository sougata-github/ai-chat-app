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
import { ChatGetOneOutput } from "@/types";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  chat: ChatGetOneOutput;
}

const ChatRenameModal = ({ open, onOpenChange, onCancel, chat }: Props) => {
  const form = useForm<z.infer<typeof chatRenameSchema>>({
    resolver: zodResolver(chatRenameSchema),
    defaultValues: {
      title: chat?.title ?? "",
    },
  });

  const utils = trpc.useUtils();

  const rename = trpc.chats.rename.useMutation({
    onSuccess: (data) => {
      toast.success("Chat Renamed");
      utils.chats.getMany.invalidate();
      utils.chats.getOne.invalidate({ chatId: data.id });
      onCancel();
    },
    onError: (error) => {
      toast.error("Failed to rename chat", {
        description: error.message || "Something went wrong. Please try again.",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof chatRenameSchema>) => {
    const { title } = values;
    if (chat) {
      rename.mutate({ chatId: chat?.id, title });
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
              disabled={rename.isPending}
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
