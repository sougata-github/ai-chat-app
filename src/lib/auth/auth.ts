import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, anonymous } from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { db } from "@/db";
import { nextCookies } from "better-auth/next-js";
import { ac, allRoles } from "./roles";
import { headers } from "next/headers";
import { cache } from "react";

export const auth = betterAuth({
  appName: 'Smart Clinic App',
  trustedOrigins: [
    "http://localhost:3000",
    // "https://ai-chat-app-gemini.vercel.app",
    // "https://ai-chat-app-dev.vercel.app",
  ],
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
                clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,     },
  },
  user: {
    	changeEmail: {
			enabled: true,
			requireVerification: false,
		},
		deleteUser: {
			enabled: true,
			deleteSessions: true,
		},
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
   	role: {
				type: 'string',
				input: false,
			},
			firstName: {
				type: 'string',
				required: false,
			},
			lastName: {
				type: 'string',
				required: false,
			},
		},
  },
  plugins: [
    admin({
			ac,
			roles: allRoles,
		}),
		nextCookies(),
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
// Memoized session retrieval (used in layouts, middlewares, etc.)
export const getSession = cache(async () => {
	return await auth.api.getSession({
		headers: await headers(),
	})
})

export type Session = typeof auth.$Infer.Session
export type User = Session['user']
export type Role = User['role']
