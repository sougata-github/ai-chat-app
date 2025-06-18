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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  //will get chatId
}

const ChatRenameModal = ({ open, onOpenChange, onCancel }: Props) => {
  const form = useForm<z.infer<typeof chatRenameSchema>>({
    resolver: zodResolver(chatRenameSchema),
    defaultValues: {
      title: "Untitled",
    },
  });

  const onSubmit = (values: z.infer<typeof chatRenameSchema>) => {
    const { title } = values;
    console.log(title);
    // perform mutation
  };

  const onCancelForm = () => {
    form.reset();
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
              variant="secondary"
              className="w-full md:w-fit"
              onClick={onCancelForm}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full md:w-fit">
              Rename
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};

export default ChatRenameModal;
