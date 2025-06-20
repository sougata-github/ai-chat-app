import { ChevronUpIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const ModelDropDown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="text-sm">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full max-md:text-xs"
        >
          gemini-flash-2.5-exp <ChevronUpIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="top"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuItem className="max-md:text-xs">
          gemini-2.5-flash-exp
        </DropdownMenuItem>
        <DropdownMenuItem className="max-md:text-xs">
          gemini-1.5-flash-exp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelDropDown;
