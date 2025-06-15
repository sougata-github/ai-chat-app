import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import SignInPage from "./SignInPage";

export default async function SignInPageWrapper() {
  const anonUserId = (await cookies()).get("userId")?.value || null;
  const { userId } = await auth();

  if (userId) return redirect("/chat");
  return <SignInPage anonUserId={anonUserId} />;
}
