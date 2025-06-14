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
    /* if userId in cookie present that means user has come to the page before -> find and update user with clerkId and other credentials 
       if no userId in cookie (user coming for first time), create a user with the clerkId and credentials. 
    */
    const { data } = evt;

    const clerkId = data.id;

    const cookieUserId = req.headers
      .get("cookie")
      ?.match(/userId=([^;]+)/)?.[1];

    console.log(cookieUserId);

    await db.user.upsert({
      where: {
        id: cookieUserId,
      },
      create: {
        clerkId,
        name: `${data.first_name || "user"} ${data.last_name || ""}`.trim(),
        email: data.email_addresses[0].email_address,
        imageUrl: data.image_url,
        verified: true,
        lastReset: new Date(),
      },
      update: {
        clerkId,
        name: `${data.first_name || "user"} ${data.last_name || ""}`.trim(),
        email: data.email_addresses[0].email_address,
        imageUrl: data.image_url,
        verified: true,
        lastReset: new Date(),
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
        name: `${data.first_name || "user"} ${data.last_name || ""}`.trim(),
        imageUrl: data.image_url,
        email: data.email_addresses[0].email_address,
      },
    });

    return new Response("User updated", { status: 200 });
  }

  return new Response("Webhook received", { status: 200 });
}
