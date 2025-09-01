"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const session = await authClient.getSession();
      console.log("Session", session);

      if (!cancelled) {
        if (!session.data?.user) {
          console.log("Signing in anonymously");
          await authClient.signIn.anonymous(
            {},
            {
              onError: (ctx) => {
                console.error(ctx.error.message);
              },
            }
          );
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
      <div className="fixed inset-0 overflow-hidden flex items-center justify-center">
        Redirecting to chat
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;
