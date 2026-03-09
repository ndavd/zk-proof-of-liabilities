import { cn } from "@/lib/utils";
import { SpinnerIcon } from "@phosphor-icons/react";
import type { PropsWithChildren } from "react";

export interface LoaderProps extends PropsWithChildren {
  className?: string;
}

export const Loader = ({ className, children }: LoaderProps) => {
  return (
    <div className="flex gap-1 items-center text-secondary-foreground/80">
      <SpinnerIcon
        role="status"
        aria-label="Loading"
        className={cn("size-4 animate-spin", className)}
      />
      {children}
    </div>
  );
};
