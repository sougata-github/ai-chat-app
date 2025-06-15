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

  await clerkClient.users.updateUser(userId, {
    privateMetadata: { anonUserId: finalAnonId },
    unsafeMetadata: { trigger: Date.now() },
  });

  return new Response("OK", { status: 200 });
}
