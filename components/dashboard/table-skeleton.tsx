import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full rounded-md" />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={String(index)} className="h-14 w-full rounded-md" />
      ))}
    </div>
  );
}