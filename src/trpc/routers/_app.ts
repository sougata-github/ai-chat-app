import { MessagesRouter } from "@/server/procedures/messages";
import { chatsRouter } from "@/server/procedures/chats";
import { userRouter } from "@/server/procedures/user";

import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  messages: MessagesRouter,
  chats: chatsRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
