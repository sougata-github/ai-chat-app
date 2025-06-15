"use client";

import { OAuthStrategy } from "@clerk/types";
import { useSignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { FaGoogle } from "react-icons/fa";

type Props = {
  anonUserId: string | null;
};

export default function SignInPage({ anonUserId }: Props) {
  const { signIn } = useSignIn();

  if (!signIn) return null;

  const handleGoogle = async (strategy: OAuthStrategy) => {
    const redirectUrl = new URL(
      "/sign-in/sso-callback",
      window.location.origin
    );

    if (anonUserId) {
      redirectUrl.searchParams.set("anonUserId", anonUserId);
    }

    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: redirectUrl.toString(),
      redirectUrlComplete: "/chat",
    });
  };

  return (
    <Button onClick={() => handleGoogle("oauth_google")} className="w-fit">
      <FaGoogle /> Sign in with Google
    </Button>
  );
}
