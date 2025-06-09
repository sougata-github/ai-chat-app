import { z } from "zod";

export const chatInputSchema = z.object({
  prompt: z
    .string()
    .min(2, {
      message: "Prompt must be at least 2 characters.",
    })
    .max(50000, {
      message: "Prompt cannot exceed 50000 characters",
    }),
});
