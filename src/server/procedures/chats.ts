import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { chatRenameSchema } from "@/schemas";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const chatsRouter = createTRPCRouter({
  getOne: baseProcedure
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

      return existingChat;
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
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;

      if (!ctx.user)
        return {
          chats: { today: [], last7Days: [], older: [] },
          nextCursor: null,
        };

      const data = await db.chat.findMany({
        where: {
          userId: ctx.user.id,
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
