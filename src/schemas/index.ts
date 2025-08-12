import { z } from "zod";

export const chatInputSchema = z.object({
  prompt: z.string(),
  file: z
    .object({
      name: z.string(),
      type: z.string(),
      url: z.string(),
      key: z.string(),
    })
    .optional(),
});

export const chatRenameSchema = z.object({
  title: z.string().min(1, {
    message: "Chat title must have at least one character.",
  }),
});
