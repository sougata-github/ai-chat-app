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
        <Button variant="ghost" size="sm" className="rounded-lg max-md:text-xs">
          gemini-2.0-flash <ChevronUpIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="top"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuItem className="max-md:text-xs">
          gemini-2.0-flash
        </DropdownMenuItem>
        <DropdownMenuItem className="max-md:text-xs">
          gemini-2.5-flash
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelDropDown;
