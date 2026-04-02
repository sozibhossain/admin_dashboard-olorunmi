import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("animate-pulse rounded-md bg-[#e6e6e6]", className)} {...props} />;
}

export { Skeleton };