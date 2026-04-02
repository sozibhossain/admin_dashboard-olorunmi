import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full rounded-xl border border-transparent bg-[#e7e7e7] px-3 py-2 text-sm text-[#1f1f1f] placeholder:text-[#9a9a9a] outline-none focus-visible:ring-2 focus-visible:ring-[#a89664]/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };