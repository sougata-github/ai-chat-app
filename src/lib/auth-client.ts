import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { getBaseURL } from "./utils";


export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [convexClient(), anonymousClient()],
});
