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
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export default function AuthPage() {
  const router = useRouter();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const [isSigningIn, setIsSigningIn] = useState(false);

  console.log(currentUser);

  useEffect(() => {
    if (currentUser && !currentUser.isAnonymous) {
      router.push("/");
    }
  }, [currentUser, router]);

  const signIn = async () => {
    try {
      await authClient.signIn.social(
        {
          provider: "google",
        },
        {
          onRequest: () => {
            setIsSigningIn(true);
          },
          onSuccess: () => {
            setIsSigningIn(false);
            window.location.replace("/");
          },
          onError: (ctx) => {
            setIsSigningIn(false);
            console.log(ctx.error.message);
          },
        }
      );
    } catch (error) {
      console.error("Sign in error", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Card className="max-w-sm w-full py-10 outline shadow outline-muted-foreground/15 dark:shadow-none dark:outline-none rounded">
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
              <Loader2 className="animate-spin mr-2 size-4 transition" />
              Signing in
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
