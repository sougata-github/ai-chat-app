import { prismaAdapter } from "better-auth/adapters/prisma";
import { anonymous } from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { db } from "@/db";

export const auth = betterAuth({
  trustedOrigins: ["https://ai-chat-app-gemini.vercel.app"],
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      isAnonymous: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
      messageCount: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      imageCount: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      lastReset: {
        type: "date",
        required: false,
      },
    },
  },
  plugins: [
    anonymous({
      onLinkAccount: async ({ newUser }) => {
        await db.user.update({
          where: {
            id: newUser.user.id,
          },
          data: {
            isAnonymous: false,
          },
        });
      },
    }),
  ],
});
