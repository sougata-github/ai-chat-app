"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useEffect, useState } from "react";

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const session = await authClient.getSession();

      if (!cancelled) {
        const userId = session.data?.user?.id;
        console.log("Auth Gate hit — User ID:", userId ?? "None");

        if (!session.data?.user) {
          console.log("No session found in Auth Gate — signing in anonymously");
          await authClient.signIn.anonymous();
        }

        setReady(true);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="overflow-hidden h-screen w-screen flex items-center justify-center">
        Redirecting to /chat
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
