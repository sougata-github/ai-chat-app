import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import superjson from "superjson";
import { cache } from "react";
import { db } from "@/db";

export const createTRPCContext = cache(async () => {
  //something that doesn't make an api call, this just destructures the JWT token

  //make the api call in the protected procedure
  const { userId } = await auth();

  return { clerkUserId: userId };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async function isAuthed(
  opts
) {
  const { ctx } = opts;

  if (!ctx.clerkUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const user = await db.user.findUnique({
    where: {
      clerkId: ctx.clerkUserId,
    },
  });

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return opts.next({
    ctx: {
      ...ctx,
      user,
    },
  });
});
