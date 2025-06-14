import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { db } from "@/db";
import { z } from "zod";

export const chatsRouter = createTRPCRouter({
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
      const { id: userId } = ctx.user;

      const { cursor, limit } = input;

      if (!userId)
        return {
          chats: { today: [], last7Days: [], older: [] },
          nextCursor: null,
        };

      const data = await db.chat.findMany({
        where: {
          userId,
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
