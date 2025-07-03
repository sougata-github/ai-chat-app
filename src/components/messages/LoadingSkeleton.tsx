import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  type: "image" | "web-search";
}

const LoadingSkeleton = ({ type }: LoadingSkeletonProps) => {
  if (type === "image") {
    return <Skeleton className="max-w-sm aspect-square rounded-lg" />;
  }

  if (type === "web-search") {
    return (
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-5 w-32 rounded-lg" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton
              key={i}
              className="h-20 max-w-md rounded-lg p-4 space-y-2"
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
