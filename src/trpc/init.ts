import { initTRPC, TRPCError } from "@trpc/server";
import { auth } from "@clerk/nextjs/server";
import superjson from "superjson";
import { db } from "@/db";

const isProd = process.env.NODE_ENV === "production";

export const createTRPCContext = async ({
  req,
  resHeaders,
}: {
  req: Request;
  resHeaders: Headers;
}) => {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim().split("=").map(decodeURIComponent))
      .filter(([k, v]) => k && v)
  );

  const userId = cookies["userId"] ?? null;

  const { userId: clerkId } = await auth();

  return { userId, clerkId, resHeaders };
};

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

export const baseProcedure = t.procedure.use(async function withUser(opts) {
  const { ctx } = opts;

  const { clerkId, userId: cookieUserId, resHeaders } = ctx;

  let user = null;

  if (clerkId) {
    user = await db.user.findUnique({
      where: {
        clerkId,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Clerk ID provided but user not found in DB.",
      });
    }

    console.log("Clerk user found.");

    resHeaders.append(
      "Set-Cookie",
      `userId=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
        60 * 60 * 24 * 7
      }${isProd ? "; Secure" : ""}`
    );

    return opts.next({
      ctx: {
        ...ctx,
        user,
      },
    });
  }

  //anonymous flow
  if (cookieUserId) {
    user = await db.user.findUnique({ where: { id: cookieUserId } });
    if (user) {
      console.log("Anonymous user found.");

      resHeaders.append(
        "Set-Cookie",
        `userId=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
          60 * 60 * 24 * 7
        }${isProd ? "; Secure" : ""}`
      );

      return opts.next({
        ctx: {
          ...ctx,
          user,
        },
      });
    }
  }

  console.log("Creating New anonymous user...");

  //fresh anonymous user
  user = await db.user.create({
    data: {
      verified: false,
    },
  });

  console.log("New anonymous user created with ID:", user.id);

  resHeaders.append(
    "Set-Cookie",
    `userId=${user.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${
      60 * 60 * 24 * 7
    }${isProd ? "; Secure" : ""}`
  );

  return opts.next({
    ctx: {
      ...ctx,
      user,
    },
  });
});
