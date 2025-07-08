import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { SpinnerIcon } from "./SpinnerIcon";

interface LoadingSkeletonProps {
  type: "image" | "web-search" | "weather";
}

const LoadingSkeleton = ({ type }: LoadingSkeletonProps) => {
  if (type === "weather") {
    return (
      <Card className="w-full bg-transparent dark:shadow-none border border-muted-foreground/15 rounded-lg px-4 shadow">
        <CardHeader className="px-0 border-b outline-muted-foreground/15">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <div className="animate-spin transition">
              <SpinnerIcon />
            </div>
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
          <div className="animate-spin transition">
            <SpinnerIcon />
          </div>
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
            <div className="animate-spin transition">
              <SpinnerIcon />
            </div>
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
