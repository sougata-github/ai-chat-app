import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { db } from "@/db";

export async function POST(req: NextRequest) {
  const evt = await verifyWebhook(req);

  const eventType = evt.type;

  if (eventType === "user.updated") {
    const data = evt.data;
    const clerkId = data.id;
    const anonUserId = data.private_metadata?.anonUserId;
    const email = data.email_addresses?.[0]?.email_address;
    const name = `${data.first_name || "user"} ${data.last_name || ""}`.trim();
    const imageUrl = data.image_url;

    if (!clerkId || !email) {
      console.warn("Missing Clerk ID or email in user.updated webhook");
      return new Response("Invalid data", { status: 400 });
    }

    try {
      if (
        anonUserId &&
        typeof anonUserId === "string" &&
        anonUserId.length > 0 &&
        anonUserId !== "none"
      ) {
        // link anon
        console.log("Linking anon user to Clerk ID:", anonUserId);

        await db.user.update({
          where: { id: anonUserId },
          data: {
            clerkId,
            name,
            email,
            imageUrl,
            verified: true,
            lastReset: new Date(),
          },
        });

        return new Response("Anon user merged", { status: 200 });
      }

      //create new user
      await db.user.upsert({
        where: { clerkId },
        update: {
          email,
          name,
          imageUrl,
        },
        create: {
          clerkId,
          name,
          email,
          imageUrl,
          verified: true,
          lastReset: new Date(),
        },
      });

      return new Response("User synced", { status: 200 });
    } catch (err) {
      console.error("Failed to sync user:", err);
      return new Response("User sync failed", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
