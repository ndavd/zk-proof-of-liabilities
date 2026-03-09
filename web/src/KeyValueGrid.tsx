import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

export interface KeyValueGridProps extends PropsWithChildren {
  className?: string;
}

export const KeyValueGrid = ({ className, children }: KeyValueGridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 w-fit",
        className,
      )}
    >
      {children}
    </div>
  );
};
