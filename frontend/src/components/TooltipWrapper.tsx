import { Tooltip } from "@mui/material";
import { ReactElement } from "react";

type TooltipWrapper = {
  children: ReactElement;
  tooltipContent: ReactElement;
  placement?: "top" | "bottom";
};

export const TooltipWrapper = ({
  children,
  tooltipContent,
  placement = "top",
}: TooltipWrapper) => {
  return (
    <Tooltip title={tooltipContent} placement={placement}>
      <div>{children}</div>
    </Tooltip>
  );
};
