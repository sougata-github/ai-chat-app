"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { FaGoogle } from "react-icons/fa";
import { createAuthClient } from "better-auth/react";
import { trpc } from "@/trpc/client";
import { Loader } from "lucide-react";

const authClient = createAuthClient();

export default function AuthPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: session } = authClient.useSession();

  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (session && session.user.name !== "Anonymous") {
      router.push("/");
    }
  }, [session, router]);

  const signIn = async () => {
    setIsSigningIn(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        fetchOptions: {
          onSuccess: () => {
            utils.user.getCurrentUser.invalidate();
            window.location.replace("/");
          },
          onError: (error) => {
            console.error("Couldn't sign in", error);
          },
        },
      });
    } catch (error) {
      console.error("Sign in error", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Card className="max-w-sm w-full py-10 outline shadow outline-muted-foreground/15 dark:shadow-none dark:outline-none rounde">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold">
          Welcome to Ai Chat
        </CardTitle>
        <CardDescription>Sign in for more credits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col items-center justify-center">
        <Button className="w-full" onClick={signIn} disabled={isSigningIn}>
          {isSigningIn ? (
            <>
              <Loader className="animate-spin mr-2 size-4 transition" />
              Signing in...
            </>
          ) : (
            <>
              <FaGoogle className="mr-2 size-4" />
              Sign in with Google
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
