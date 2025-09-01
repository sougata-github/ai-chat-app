import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

// load streams for a chat
export const loadStreams = query({
  args: { chatId: v.string() }, // uuid
  handler: async (ctx, { chatId }) => {
    const streams = await ctx.db
      .query("streams")
      .withIndex("by_chat", (q) => q.eq("chatId", chatId))
      .collect();

    return streams.map((stream) => stream.id);
  },
});

// append stream id
export const appendStreamId = mutation({
  args: {
    chatId: v.string(), // uuid
    streamId: v.string(), //uuid
  },
  handler: async (ctx, { chatId, streamId }) => {
    await ctx.db.insert("streams", {
      id: streamId,
      chatId,
      createdAt: Date.now(),
    });
  },
});
