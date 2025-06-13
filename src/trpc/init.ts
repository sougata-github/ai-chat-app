import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import superjson from "superjson";
import { cache } from "react";
import { db } from "@/db";

export const createTRPCContext = cache(async () => {
  //something that doesn't make an api call, this just destructures the JWT token

  //first check for clerkId
  const { userId: clerkId } = await auth();

  if (clerkId) {
    return { clerkId };
  }

  // no clerk, check cookie
  const cookiesStore = await cookies();
  let userId = cookiesStore.get("userId")?.value;

  // case where user lands for first time
  if (!userId) {
    userId = crypto.randomUUID();
    cookiesStore.set("userId", userId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return { userId };
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

export const baseProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;

  let user;

  if (ctx.clerkId) {
    user = await db.user.findUnique({
      where: {
        clerkId: ctx.clerkId,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  } else if (ctx.userId) {
    user = await db.user.findUnique({
      where: {
        id: ctx.userId,
      },
    });
  }

  if (!user) {
    user = await db.user.create({
      data: {
        id: ctx.userId,
        verified: false,
        lastReset: new Date(),
      },
    });
  }

  return opts.next({
    ctx: {
      ...ctx,
      user,
    },
  });
});
