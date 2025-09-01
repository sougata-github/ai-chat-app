import { useEffect } from "react";

export function useAutoResume({
  autoResume,
  resumeStream,
}: {
  autoResume: boolean;
  resumeStream: () => void;
}) {
  useEffect(() => {
    if (autoResume) {
      resumeStream();
    } else {
      const url = new URL(window.location.href);
      if (url.searchParams.has("skipResume")) {
        url.searchParams.delete("skipResume");
        window.history.replaceState(null, "", url.toString());
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
