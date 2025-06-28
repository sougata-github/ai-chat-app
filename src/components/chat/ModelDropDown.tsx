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
import { MODEL_REGISTRY, ModelId } from "@/lib/model/model";
import { saveChatModelAsCookie } from "@/lib/model";

interface ModelDropDownProps {
  initialModel: ModelId;
}

const ModelDropDown = ({ initialModel }: ModelDropDownProps) => {
  const [optimisticModel, setOptimisticModel] = useOptimistic(
    initialModel || "llama3-8b-8192"
  );

  const handleModelChange = (modelId: ModelId) => {
    startTransition(async () => {
      setOptimisticModel(modelId);
      await saveChatModelAsCookie(modelId);
    });
  };

  const currentModel = MODEL_REGISTRY[optimisticModel];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="text-sm">
        <Button variant="ghost" size="sm" className="rounded-lg max-md:text-xs">
          {currentModel.name}
          <ChevronUpIcon className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side="top"
        align="start"
        sideOffset={4}
      >
        {Object.entries(MODEL_REGISTRY).map(([modelId, config]) => (
          <DropdownMenuItem
            key={modelId}
            className={`mb-2 max-md:text-xs cursor-pointer ${
              modelId === optimisticModel ? "bg-muted font-semibold" : ""
            }`}
            onClick={() => handleModelChange(modelId as ModelId)}
          >
            <div className="flex flex-col">
              <span>{config.name}</span>
              <span className="text-xs text-muted-foreground">
                {config.description}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModelDropDown;
