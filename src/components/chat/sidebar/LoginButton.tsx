"use client";

import { Button } from "@/components/ui/button";

import { LogIn } from "lucide-react";
import Link from "next/link";

const LoginButton = () => {
  return (
    <Link href="/auth" className="w-full flex">
      <Button variant="ghost" className="justify-start gap-4 w-full" size="lg">
        <LogIn /> Log In
      </Button>
    </Link>
  );
};

export default LoginButton;
