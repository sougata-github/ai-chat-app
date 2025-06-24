import { chatsRouter } from "@/server/procedures/chats";
import { userRouter } from "@/server/procedures/user";

import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  chats: chatsRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
