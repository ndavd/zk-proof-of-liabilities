import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "@/components/ui/popover";
import type {
  TooltipContentProps,
  TooltipProps,
  TooltipTriggerProps,
} from "@radix-ui/react-tooltip";
import type {
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
} from "@radix-ui/react-popover";

const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;

export const HybridTooltip = (props: TooltipProps & PopoverProps) => {
  return isTouchDevice() ? <Popover {...props} /> : <Tooltip {...props} />;
};

export const HybridTooltipTrigger = (
  props: TooltipTriggerProps & PopoverTriggerProps,
) => {
  return isTouchDevice() ? (
    <PopoverTrigger autoFocus={false} {...props} />
  ) : (
    <TooltipTrigger {...props} />
  );
};

export const HybridTooltipContent = (
  props: TooltipContentProps & PopoverContentProps,
) => {
  return isTouchDevice() ? (
    <PopoverContent autoFocus={false} side="top" align="start" {...props}>
      <PopoverClose>{props.children}</PopoverClose>
    </PopoverContent>
  ) : (
    <TooltipContent {...props} />
  );
};
