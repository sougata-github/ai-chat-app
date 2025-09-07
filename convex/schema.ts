import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),

    isAnonymous: v.optional(v.boolean()),
    messageCount: v.number(),
    lastReset: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  chats: defineTable({
    id: v.string(),
    title: v.string(),
    archived: v.boolean(),
    userId: v.string(),
    status: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_archived", ["userId", "archived"])
    .index("by_user_updated", ["userId", "updatedAt"])
    .index("by_uuid", ["id"]),

  messages: defineTable({
    id: v.string(),
    role: v.string(),
    parts: v.any(),
    imageKey: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    attachmentId: v.optional(v.string()),
    fileKey: v.optional(v.string()),
    userId: v.string(),
    chatId: v.string(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_user", ["userId"])
    .index("by_chat_created", ["chatId", "createdAt"])
    .index("by_attachment", ["attachmentId"])
    .index("by_uuid", ["id"]),

  attachments: defineTable({
    id: v.string(),
    name: v.string(),
    type: v.string(),
    url: v.string(),
    key: v.optional(v.string()),

    messageId: v.string(),
    chatId: v.string(),
    userId: v.string(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_message", ["messageId"])
    .index("by_uuid", ["id"])
    .index("by_chatId", ["chatId"]),

  streams: defineTable({
    id: v.string(),
    chatId: v.string(),
    createdAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_stream", ["id"]),
});
