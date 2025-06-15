import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { db } from "@/db";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console

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
