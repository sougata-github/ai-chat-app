import type { GenericCtx } from "@convex/_generated/server";
import { convex } from "@convex-dev/better-auth/plugins";
import { convexAdapter } from "@convex-dev/better-auth";
import { betterAuthComponent } from "@convex/auth";
import { anonymous } from "better-auth/plugins";
import { betterAuth } from "better-auth";


const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const createOptions = (ctx: GenericCtx) => ({
  baseURL,
  database: convexAdapter(ctx, betterAuthComponent),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      allowDifferentEmails: true,
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  trustedOrigins: [
    "https://ai-chat-app-dev.vercel.app",
    "http://localhost:3000",
  ],
  plugins: [
    anonymous({
      onLinkAccount: async () => {
        console.log("Linking anonymous account to new user");
      },
    }),
  ],
});

export const createAuth = (ctx: GenericCtx) => {
  const options = createOptions(ctx);
  return betterAuth({
    ...options,
    plugins: [...options.plugins, convex({ options })],
  });
};
