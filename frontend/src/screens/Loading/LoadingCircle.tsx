import { CircularProgress } from "@mui/material";
import { tokens } from "../../tokens";

type LoadingCircleProps = {
  size?: "small" | "big";
};
export const LoadingCircle = ({ size = "small" }: LoadingCircleProps) => {
  return (
    <CircularProgress
      sx={{ color: tokens.color.accent.dark }}
      size={`${size === "small" ? 24 : 40}px`}
    />
  );
};
