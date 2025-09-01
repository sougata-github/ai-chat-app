import {
  BetterAuth,
  type AuthFunctions,
  type PublicAuthFunctions,
} from "@convex-dev/better-auth";
import { createAuth } from "@/lib/auth";

import { api, components, internal } from "./_generated/api";
import type { Id, DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";

const authFunctions: AuthFunctions = internal.auth;
const publicAuthFunctions: PublicAuthFunctions = api.auth;

export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
  publicAuthFunctions,
});

export const {
  createUser,
  updateUser,
  deleteUser,
  createSession,
  isAuthenticated,
} = betterAuthComponent.createAuthFunctions<DataModel>({
  onCreateUser: async (ctx, user) => {
    console.log("User created Event");

    const now = Date.now();

    const userId = await ctx.db.insert("users", {
      name: user.name || undefined,
      email: user.email || undefined,
      emailVerified: user.emailVerified || false,
      image: user.image || undefined,
      isAnonymous: user.isAnonymous || false,
      messageCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },

  // update user when better-auth updates user metadata
  onUpdateUser: async (ctx, user) => {
    console.log("User updated Event");

    const now = Date.now();

    await ctx.db.patch(user.userId as Id<"users">, {
      name: user.name || undefined,
      email: user.email || undefined,
      emailVerified: user.emailVerified || false,
      image: user.image || undefined,
      isAnonymous: user.isAnonymous || false,
      updatedAt: now,
    });
  },

  // delete the user when they are deleted from better-auth
  onDeleteUser: async (ctx, userId) => {
    console.log("User deleted Event");

    // delete user and all related data
    const user = await ctx.db.get(userId as Id<"users">);
    if (!user) return;

    // delete all user chats and messages
    const userChats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", userId as Id<"users">))
      .collect();

    for (const chat of userChats) {
      const attachments = await ctx.db
        .query("attachments")
        .withIndex("by_chatId", (q) => q.eq("chatId", chat.id))
        .collect();

      const messagesWithImages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", chat.id))
        .filter((q) => q.or(q.neq(q.field("imageKey"), undefined)))
        .collect();

      const imageKeys = messagesWithImages
        .map((m) => m.imageKey)
        .filter((k): k is string => !!k);

      const attachmentKeys = attachments
        .map((a) => a.key)
        .filter((k): k is string => !!k);

      //uploadthing cleanup action
      const allKeys = [...imageKeys, ...attachmentKeys];

      if (allKeys.length > 0) {
        await ctx.scheduler.runAfter(0, internal.uploadthing.deleteFiles, {
          keys: allKeys,
        });
      }

      for (const attachment of attachments) {
        console.log("Deleting attachments");
        await ctx.db.delete(attachment._id);
      }

      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", chat.id))
        .collect();

      for (const message of messages) {
        await ctx.db.delete(message._id);
      }

      const streams = await ctx.db
        .query("streams")
        .withIndex("by_chat", (q) => q.eq("chatId", chat.id))
        .collect();

      for (const stream of streams) {
        await ctx.db.delete(stream._id);
      }

      await ctx.db.delete(chat._id);
    }

    // delete the user
    await ctx.db.delete(userId as Id<"users">);
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // user data from better-auth (email, name, etc)
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);

    if (!userMetadata) {
      return null;
    }

    // logged-in user data from DB
    const user = await ctx.db.get(userMetadata.userId as Id<"users">);

    return {
      ...user,
      ...userMetadata,
    };
  },
});

export const getSession = query({
  args: {},
  handler: async (ctx) => {
    const auth = createAuth(ctx);
    const headers = await betterAuthComponent.getHeaders(ctx);
    const session = await auth.api.getSession({
      headers,
    });
    if (!session) {
      return null;
    }
    return session;
  },
});
