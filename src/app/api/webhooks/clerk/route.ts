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

  if (eventType === "user.created") {
    const { data } = evt;

    //create user
    await db.user.create({
      data: {
        clerkId: data.id,
        name: `${data.first_name || "user"} ${data.last_name || ""}`.trim(),
        imageUrl: data.image_url,
        verified: true,
      },
    });

    return new Response("User created", { status: 201 });
  }

  if (eventType === "user.deleted") {
    const { data } = evt;

    if (!data.id) {
      return new Response("User id missing", { status: 400 });
    }

    //delete user
    await db.user.delete({
      where: {
        clerkId: data.id,
      },
    });

    return new Response("User deleted", { status: 200 });
  }

  if (eventType === "user.updated") {
    const { data } = evt;

    if (!data.id) {
      return new Response("User id missing", { status: 400 });
    }

    //update user
    await db.user.update({
      where: {
        clerkId: data.id,
      },
      data: {
        name: `${data.first_name ? data.first_name : "user"} ${
          data.last_name ? data.last_name : ""
        }`,
        imageUrl: data.image_url,
      },
    });

    return new Response("User updated", { status: 200 });
  }

  return new Response("Webhook received", { status: 200 });
}
