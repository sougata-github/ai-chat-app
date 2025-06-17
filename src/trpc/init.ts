import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@/lib/auth/auth";
import superjson from "superjson";

export const createTRPCContext = async ({
  req,
  resHeaders,
}: {
  req: Request;
  resHeaders: Headers;
}) => {
  // session should typically always exist
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    console.log("No session found");
    return { user: null, resHeaders };
  }

  console.log("logged-in session found");

  return {
    user: session.user,
    resHeaders,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const baseProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Missing user" });
  }

  return opts.next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
