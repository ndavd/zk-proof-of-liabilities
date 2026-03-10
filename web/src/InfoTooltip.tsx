import {
  HybridTooltip,
  HybridTooltipContent,
  HybridTooltipTrigger,
} from "@/HybridTooltip";
import { cn } from "@/lib/utils";
import { InfoIcon } from "@phosphor-icons/react";
import type { PropsWithChildren, ReactNode } from "react";

export interface InfoTooltipProps extends PropsWithChildren {
  info: ReactNode;
  icon?: {
    className: string;
  };
}

export const InfoTooltip = ({ info, icon, children }: InfoTooltipProps) => {
  return (
    <HybridTooltip>
      <HybridTooltipContent>{info}</HybridTooltipContent>
      <HybridTooltipTrigger asChild>
        <div className="flex gap-1 items-center">
          <InfoIcon className={cn("size-3", icon?.className)} />
          <span>{children}</span>
        </div>
      </HybridTooltipTrigger>
    </HybridTooltip>
  );
};
