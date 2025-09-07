import { ConvexError, v } from "convex/values";

import { mutation } from "./_generated/server";
import { betterAuthComponent } from "./auth";

export const updateUser = mutation({
  args: {
    cost: v.number(),
  },
  handler: async (ctx, { cost }) => {
    const authUser = await betterAuthComponent.getAuthUser(ctx);
    if (!authUser) throw new ConvexError("Unauthorized");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), authUser.userId))
      .first();
    if (!user) throw new Error("User not found");

    await ctx.db.patch(user._id, {
      messageCount: (user.messageCount ?? 0) + cost,
      updatedAt: Date.now(),
    });
  },
});
