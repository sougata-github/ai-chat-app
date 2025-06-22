import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";

export const MessagesRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        chatId: z.string().uuid(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, chatId } = input;

      if (!ctx.user)
        return {
          messages: [],
          nextCursor: null,
        };

      const existingChat = await db.chat.findUnique({
        where: {
          id: chatId,
        },
      });

      if (!existingChat) throw new TRPCError({ code: "NOT_FOUND" });

      //fetch in ascending order
      const data = await db.message.findMany({
        where: {
          chatId,
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

      const messages = hasMore ? data.slice(0, -1) : data;

      const formattedMessages = messages.map((msg) => ({
        id: msg.id,
        role: msg.role.toLowerCase() === "user" ? "user" : "assistant",
        content: msg.content,
        createdAt: msg.createdAt,
      }));

      const lastMessage = messages[0];

      const nextCursor = hasMore
        ? {
            id: lastMessage.id,
            updatedAt: lastMessage.updatedAt,
          }
        : null;

      return {
        formattedMessages,
        nextCursor,
      };
    }),
});
