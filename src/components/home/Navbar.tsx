import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "../ui/button";

const Navbar = () => {
  return (
    <header className="flex h-20 items-center justify-between border-b p-5">
      <div>
        <Link href="/">
          <span className="text-base font-semibold">Vertext.ai</span>
        </Link>
      </div>

      <SignedIn>
        <Button asChild className="group" variant="secondary">
          <Link href="/chat">
            Enter
            <ChevronRight className="size-4 transition-all duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </SignedIn>

      <SignedOut>
        <div className="flex gap-4">
          <SignInButton mode="modal">
            <Button variant="ghost" className="border">
              Log in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="secondary">Sign Up</Button>
          </SignUpButton>
        </div>
      </SignedOut>
    </header>
  );
};

export default Navbar;
