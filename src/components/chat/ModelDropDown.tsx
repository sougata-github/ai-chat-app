"use client";

import { ChevronUpIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { startTransition, useOptimistic } from "react";
import { MODEL_REGISTRY, type ModelId } from "@/lib/model/model";
import { saveChatModelAsCookie } from "@/lib/model";
import { Tool } from "@/lib/tools/tool";
import Image from "next/image";

interface ModelDropDownProps {
  initialModel: ModelId;
  currentTool: Tool;
  disabled?: boolean;
}

const ModelDropDown = ({
  initialModel,
  disabled = false,
  currentTool,
}: ModelDropDownProps) => {
  const [optimisticModel, setOptimisticModel] = useOptimistic(
    initialModel || "gemini-2.5-flash-lite-preview-06-17"
  );

  const handleModelChange = (modelId: ModelId) => {
    if (disabled) return;

    startTransition(async () => {
      setOptimisticModel(modelId);
      await saveChatModelAsCookie(modelId);
    });
  };

  const currentModel = MODEL_REGISTRY[optimisticModel];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="text-sm">
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-lg max-md:text-xs ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={disabled}
        >
          {currentModel.name}
          <ChevronUpIcon className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg px-2 pt-2.5"
        side="top"
        align="start"
        sideOffset={4}
      >
        {Object.entries(MODEL_REGISTRY).map(([modelId, config]) => (
          <DropdownMenuItem
            key={modelId}
            className={`mb-2 max-md:text-xs cursor-pointer ${
              modelId === optimisticModel ? "bg-muted font-semibold" : ""
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => !disabled && handleModelChange(modelId as ModelId)}
            disabled={
              disabled ||
              (modelId === "qwen/qwen3-32b" && currentTool !== "reasoning")
            }
          >
            <div className="flex items-center gap-1.5">
              <Image
                src={config.logo}
                alt={`${config.name}`}
                width={20}
                height={20}
                className="size-4"
              />
              <span className="max-sm:text-xs">{config.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelDropDown;
