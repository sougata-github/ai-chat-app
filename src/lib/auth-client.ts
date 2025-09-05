import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";


const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  plugins: [convexClient(), anonymousClient()],
});
