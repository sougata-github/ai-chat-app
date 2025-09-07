import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "@convex/_generated/api";
import { LIMITS } from "@/constants";

export const RESET_WINDOW = 1 * 12 * 60 * 60 * 1000;

export function useUsageStatus() {
  const user = useQuery(api.auth.getCurrentUser);

  if (!user) {
    return {
      isLoading: user === undefined,
      canSend: false,
      messagesLeft: 0,
      nextReset: null,
      tier: "guest",
      limit: LIMITS["guest"],
    };
  }

  const tier = user.emailVerified ? "verified" : "guest";

  const limit = LIMITS[tier];
  const count = user.messageCount ?? 0;

  return {
    isLoading: user === undefined,
    canSend: count < limit,
    messagesLeft: Math.max(0, limit - count),
    nextReset: user.lastReset ? user.lastReset + RESET_WINDOW : null,
    tier,
    limit,
  };
}
