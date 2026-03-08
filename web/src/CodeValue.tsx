import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { useState, type PropsWithChildren } from "react";

export interface CodeValue extends PropsWithChildren {
  copyValue?: string;
}

export const CodeValue = ({ copyValue, children }: CodeValue) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const [hasCopied, setHasCopied] = useState(false);
  return (
    <Tooltip
      onOpenChange={(open) => {
        if (!open) setTimeout(() => setHasCopied(false), 100);
      }}
    >
      <TooltipContent onPointerDownOutside={(e) => e.preventDefault()}>
        {hasCopied ? "Copied!" : "Copy"}
      </TooltipContent>
      <TooltipTrigger
        onPointerDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          copyToClipboard(copyValue ?? children?.toString() ?? "");
          setHasCopied(true);
        }}
      >
        <code className="cursor-pointer bg-secondary px-1 hover:text-primary-foreground">
          {children}
        </code>
      </TooltipTrigger>
    </Tooltip>
  );
};
