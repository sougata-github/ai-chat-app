"use client";

import { Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import React, { startTransition } from "react";
import { getModelForTool, Tool, TOOL_REGISTRY } from "@/lib/tools/tool";
import { saveToolAsCookie } from "@/lib/tools";
import { ModelId } from "@/lib/model/model";
import { saveChatModelAsCookie } from "@/lib/model";

interface ModelDropDownProps {
  disabledAll: boolean;
  initialModel: ModelId;
  optimisticTool: Tool;
  setOptimisticTool: (toolId: Tool) => void;
}

const ToolDropDown = ({
  disabledAll,
  initialModel,
  optimisticTool,
  setOptimisticTool,
}: ModelDropDownProps) => {
  const handleToolChange = (toolId: Tool) => {
    startTransition(async () => {
      setOptimisticTool(toolId);
      await saveToolAsCookie(toolId);

      // set appropriate model for the tool
      if (toolId !== "none") {
        const toolModel = getModelForTool(toolId, initialModel);
        await saveChatModelAsCookie(toolModel as ModelId);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="text-sm">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full max-md:text-xs`}
          disabled={disabledAll}
        >
          <Settings2 />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] rounded-lg px-2 pt-2.5"
        side="top"
        align="start"
        sideOffset={4}
      >
        {Object.entries(TOOL_REGISTRY).map(([toolId, config]) => (
          <DropdownMenuItem
            key={toolId}
            className={`mb-2 max-md:text-xs cursor-pointer ${
              toolId === optimisticTool ? "bg-muted font-semibold" : ""
            } `}
            onClick={() => handleToolChange(toolId as Tool)}
            //disable when the tool rate limit hits
          >
            <div className="flex items-center gap-2">
              {<config.icon />}
              {config.name}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ToolDropDown;
