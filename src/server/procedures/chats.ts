import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { chatRenameSchema } from "@/schemas";
import { SYSTEM_PROMPT } from "@/constants";
import { TRPCError } from "@trpc/server";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { db } from "@/db";
import { z } from "zod";

export const chatsRouter = createTRPCRouter({
  createOne: baseProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prompt } = input;

      const { user } = ctx;

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // 1. Create chat
      const chat = await db.chat.create({
        data: {
          userId: user.id,
          title: "New Chat",
        },
      });

      // 2. Create user message
      const userMessage = await db.message.create({
        data: {
          role: "USER",
          chatId: chat.id,
          userId: user.id,
          content: prompt,
        },
      });

      // 3. Stream response from LLM
      const llmStream = streamText({
        model: google("gemini-1.5-flash"),
        prompt: input.prompt,
        system: SYSTEM_PROMPT,
      });

      let fullResponse = "";
      for await (const delta of llmStream.textStream) {
        fullResponse += delta;
      }

      if (!fullResponse) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch response",
        });
      }

      // 4. Create AI message
      const aiMessage = await db.message.create({
        data: {
          role: "AI",
          chatId: chat.id,
          userId: user.id,
          content: fullResponse,
          promptId: userMessage.id,
        },
      });

      if (!aiMessage)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create ai message record",
        });

      // 6. Generate a summarised title using LLM
      const titleResult = streamText({
        model: google("gemini-1.5-flash"),
        prompt: `Summarise this response in 4-6 words: ${fullResponse}`,
        system: "You are a title summarizer.",
      });

      let summary = "";
      for await (const delta of titleResult.textStream) {
        summary += delta;
      }

      // 7. Update chat with title
      await db.chat.update({
        where: { id: chat.id },
        data: {
          title: summary.trim() || "Untitled",
        },
      });

      return {
        chatId: chat.id,
      };
    }),
  restore: baseProcedure
    .input(
      z.object({
        chatId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { chatId } = input;

      const { user } = ctx;

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const restoredChat = await db.chat.update({
        where: {
          id: chatId,
          userId: user.id,
        },
        data: {
          archived: false,
        },
      });

      if (!restoredChat) throw new TRPCError({ code: "NOT_FOUND" });

      return restoredChat;
    }),
  archive: baseProcedure
    .input(
      z.object({
        chatId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { chatId } = input;

      const { user } = ctx;

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const archivedChat = await db.chat.update({
        where: {
          id: chatId,
          userId: user.id,
        },
        data: {
          archived: true,
        },
      });

      if (!archivedChat) throw new TRPCError({ code: "NOT_FOUND" });

      return archivedChat;
    }),
  rename: baseProcedure
    .input(
      z.object({
        chatId: z.string().uuid(),
        title: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { chatId, title } = input;

      const validatedFields = chatRenameSchema.safeParse({ title });

      if (!validatedFields.success)
        throw new TRPCError({ code: "BAD_REQUEST" });

      const { user } = ctx;

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const updatedChat = await db.chat.update({
        where: {
          id: chatId,
          userId: user.id,
        },
        data: {
          title,
        },
      });

      if (!updatedChat) throw new TRPCError({ code: "NOT_FOUND" });

      return updatedChat;
    }),
  deleteOne: baseProcedure
    .input(
      z.object({
        chatId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { chatId } = input;

      const { user } = ctx;

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existingChat = await db.chat.findUnique({
        where: {
          id: chatId,
          userId: user.id,
        },
      });

      if (!existingChat) throw new TRPCError({ code: "NOT_FOUND" });

      const deletedChat = await db.chat.delete({
        where: {
          id: existingChat.id,
        },
      });

      return deletedChat;
    }),
  search: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        query: z.string().nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, query } = input;

      if (!ctx.user)
        return {
          chats: [],
          nextCursor: null,
        };

      const data = await db.chat.findMany({
        where: {
          userId: ctx.user.id,
          archived: false,
          ...(query && {
            title: {
              contains: query,
              mode: "insensitive",
            },
          }),
          ...(cursor && {
            OR: [
              {
                updatedAt: {
                  lt: cursor.updatedAt,
                },
              },
              {
                updatedAt: cursor.updatedAt,
                id: {
                  lt: cursor.id,
                },
              },
            ],
          }),
        },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        include: {
          user: true,
        },
        take: limit + 1,
      });

      const hasMore = data.length > limit;

      const chats = hasMore ? data.slice(0, -1) : data;

      const lastChat = chats[chats.length - 1];

      const nextCursor = hasMore
        ? {
            id: lastChat.id,
            updatedAt: lastChat.updatedAt,
          }
        : null;

      return {
        chats,
        nextCursor,
      };
    }),
  getOne: baseProcedure
    .input(
      z.object({
        chatId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { chatId } = input;

      const { user } = ctx;

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existingChat = await db.chat.findUnique({
        where: {
          id: chatId,
          userId: user.id,
        },
      });

      if (!existingChat) throw new TRPCError({ code: "NOT_FOUND" });

      return existingChat;
    }),
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        isArchived: z.boolean().default(false),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, isArchived } = input;

      if (!ctx.user)
        return {
          chats: { today: [], last7Days: [], older: [] },
          nextCursor: null,
        };

      const data = await db.chat.findMany({
        where: {
          userId: ctx.user.id,
          archived: isArchived,
          ...(cursor && {
            OR: [
              {
                updatedAt: {
                  lt: cursor.updatedAt,
                },
              },
              {
                updatedAt: cursor.updatedAt,
                id: {
                  lt: cursor.id,
                },
              },
            ],
          }),
        },
        orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
        include: {
          user: true,
        },
        take: limit + 1,
      });

      const hasMore = data.length > limit;

      const chats = hasMore ? data.slice(0, -1) : data;

      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const categorized = {
        today: [] as typeof chats,
        last7Days: [] as typeof chats,
        older: [] as typeof chats,
      };

      for (const chat of chats) {
        if (chat.updatedAt >= startOfToday) {
          categorized.today.push(chat);
        } else if (chat.updatedAt >= sevenDaysAgo) {
          categorized.last7Days.push(chat);
        } else {
          categorized.older.push(chat);
        }
      }

      const lastChat = chats[chats.length - 1];

      const nextCursor = hasMore
        ? {
            id: lastChat.id,
            updatedAt: lastChat.updatedAt,
          }
        : null;

      return {
        chats: categorized,
        nextCursor,
      };
    }),
});
