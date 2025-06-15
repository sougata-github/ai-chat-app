"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";

type Props = {
  anonUserId: string | null;
};

export default function SSOCallbackClient({ anonUserId }: Props) {
  const { handleRedirectCallback } = useClerk();
  const { isLoaded, user, isSignedIn } = useUser();
  const router = useRouter();

  //redirect flow
  useEffect(() => {
    handleRedirectCallback({}).catch((err) => {
      console.error("Redirect callback failed:", err);
    });
  }, [handleRedirectCallback]);

  // attach metadata once flow is complete
  useEffect(() => {
    if (!isLoaded || !user || !isSignedIn || !anonUserId) return;

    fetch("/api/clerk", {
      method: "POST",
      body: JSON.stringify({ anonUserId }),
    }).finally(() => {
      router.push("/chat");
    });
  }, [isLoaded, user, isSignedIn, anonUserId, router]);

  return null;
}
