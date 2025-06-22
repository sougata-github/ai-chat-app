import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "@/trpc/routers/_app";

export type ChatGetOneOutput = inferRouterOutputs<AppRouter>["chats"]["getOne"];

export type MessagesGetManyOutput =
  inferRouterOutputs<AppRouter>["messages"]["getMany"];
