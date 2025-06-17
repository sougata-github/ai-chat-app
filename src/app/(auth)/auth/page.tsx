"use client";

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

export default function AuthPage() {
  const utils = trpc.useUtils();

  const authClient = createAuthClient();

  const signIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      fetchOptions: {
        onSuccess: () => {
          utils.user.getCurrentUser.invalidate();
          window.location.replace("/chat");
        },
        onError: (error) => {
          console.log("Couldn't sign in", error);
        },
      },
    });
  };

  return (
    <Card className="max-w-sm w-full py-10">
      <CardHeader className="text-center">
        <CardTitle>Welcome to Chat Gemini</CardTitle>
        <CardDescription>Sign in for more credits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col items-center justify-center">
        <Button className="w-full" onClick={signIn}>
          <FaGoogle />
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  );
}
