import { chatsRouter } from "@/server/procedures/chats";

import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  chats: chatsRouter,
});

export type AppRouter = typeof appRouter;
