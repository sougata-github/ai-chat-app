import { createClerkClient } from "@clerk/backend";
import { auth } from "@clerk/nextjs/server";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { anonUserId } = await req.json().catch(() => ({}));
  const finalAnonId = anonUserId ?? "none";

  const user = await clerkClient.users.getUser(userId);
  const existingAnonId = user.privateMetadata?.anonUserId;

  if (existingAnonId !== finalAnonId) {
    await clerkClient.users.updateUser(userId, {
      privateMetadata: { anonUserId: finalAnonId },
    });
  }

  return new Response("OK", { status: 200 });
}
