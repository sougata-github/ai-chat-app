import { Clock, Lightbulb, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { IconLoader2 } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface LoadingSkeletonProps {
  type: "image" | "web-search" | "weather" | "reasoning";
}

const LoadingSkeleton = ({ type }: LoadingSkeletonProps) => {
  if (type === "reasoning") {
    return (
      <Card className="w-full bg-transparent dark:shadow-none border border-muted-foreground/15 rounded-lg px-4 shadow">
        <CardHeader className="px-0 border-b outline-muted-foreground/15">
          <div className="flex items-center text-base font-medium">
            <Lightbulb className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">Thinking deeply...</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Processing complex reasoning</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <Skeleton className="h-3 w-32" />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="p-3 dark:bg-muted-foreground/15 dark:outline-none dark:shadow-none shadow outline outline-muted-foreground/15 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <Skeleton className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                    {index === 1 && <Skeleton className="h-3 w-3/4" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "weather") {
    return (
      <Card className="w-full bg-transparent dark:shadow-none border border-muted-foreground/15 rounded-lg px-4 shadow">
        <CardHeader className="px-0 border-b outline-muted-foreground/15">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Loader2 className="w-4 h-4 animate-spin transition" />
            Getting weather data
          </CardTitle>
          <CardDescription className="text-sm">
            Please wait while I fetch the weather information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          {/* Current Weather Skeleton */}
          <div className="dark:bg-muted-foreground/10 outline outline-muted-foreground/15 rounded-lg p-4 space-y-3 dark:outline-none shadow dark:shadow-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-24 hidden sm:block" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>

          <div className="dark:bg-muted-foreground/10 outline outline-muted-foreground/15 rounded-lg p-4 space-y-3 dark:outline-none shadow dark:shadow-none">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="text-center space-y-2">
                  <Skeleton className="h-3 w-8 mx-auto" />
                  <Skeleton className="h-6 w-6 mx-auto rounded-full" />
                  <Skeleton className="h-4 w-6 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "image") {
    return (
      <div className="space-y-3 max-w-sm max-md:max-w-full">
        <div className="text-sm flex items-center gap-2">
          <IconLoader2 className="w-4 h-4 animate-spin transition" />
          Generating the Image
        </div>
        <Skeleton className="max-w-sm aspect-square rounded-lg" />
      </div>
    );
  }

  if (type === "web-search") {
    return (
      <Card className="w-full bg-transparent dark:shadow-none border border-muted-foreground/15 rounded-lg px-4 shadow">
        <CardHeader className="px-0 border-b outline-muted-foreground/15">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <IconLoader2 className="w-4 h-4 animate-spin transition" />
            Searching the web
          </CardTitle>
          <CardDescription className="text-sm">
            Please wait while I fetch relevant results.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-0">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="dark:bg-muted-foreground/10 outline outline-muted-foreground/15 rounded-lg p-4 space-y-3 dark:outline-none shadow dark:shadow-none"
            >
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-4 w-full" />
              </div>

              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[90%]" />
                <Skeleton className="h-3 w-[85%]" />
              </div>

              <div className="flex items-center justify-between text-xs">
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default LoadingSkeleton;
