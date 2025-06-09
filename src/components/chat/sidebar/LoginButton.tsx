"use client";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

const LoginButton = () => {
  return (
    <SignInButton>
      <Button variant="ghost">Log In</Button>
    </SignInButton>
  );
};

export default LoginButton;
