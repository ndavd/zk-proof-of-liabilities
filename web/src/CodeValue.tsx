import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useState, type PropsWithChildren } from "react";

export interface CodeValue extends PropsWithChildren {
  className?: string;
  copyValue?: string;
}

export const CodeValue = ({ copyValue, className, children }: CodeValue) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const [hasCopied, setHasCopied] = useState(false);
  return (
    <Tooltip
      onOpenChange={(open) => {
        if (!open) setTimeout(() => setHasCopied(false), 100);
      }}
    >
      <TooltipContent
        onPointerDownOutside={(e) => e.preventDefault()}
        side="right"
      >
        {hasCopied ? "Copied!" : "Copy"}
      </TooltipContent>
      <TooltipTrigger
        asChild
        onPointerDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          copyToClipboard(copyValue ?? children?.toString() ?? "");
          setHasCopied(true);
        }}
      >
        <code
          className={cn(
            "overflow-x-scroll no-scrollbar cursor-pointer bg-secondary px-1 text-secondary-foreground/70 hover:text-primary-foreground",
            className,
          )}
        >
          {children}
        </code>
      </TooltipTrigger>
    </Tooltip>
  );
};
