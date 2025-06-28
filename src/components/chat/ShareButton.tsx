"use client";

import { Share } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  chatId?: string;
}

const ShareButton = ({ chatId }: Props) => {
  const [copied, setCopied] = useState(false);

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/share/${chatId}`;

  const onCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Chat Link copied to clipboard");
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Button variant="ghost" onClick={onCopy}>
      {copied ? "Copied" : <Share />}
    </Button>
  );
};

export default ShareButton;
