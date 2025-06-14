import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

const handler = async (req: Request) => {
  const resHeaders = new Headers();

  return await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => createTRPCContext({ req, resHeaders }),
    responseMeta: () => ({ headers: resHeaders }),
  });
};
export { handler as GET, handler as POST };
