import { TooltipWrapper } from "../TooltipWrapper";
import { Styles } from "../../utils/Styles";
import { Level } from "../../hooks/StudentProfile";
import { Avatar, AvatarSize } from "./Avatar";

type AnimalWithTooltipProps = {
  level: Level;
  size: AvatarSize;
  disabled?: boolean;
  shadow?: boolean;
};

export const AnimalWithTooltip = ({
  level,
  size,
  disabled,
  shadow,
}: AnimalWithTooltipProps) => {
  return (
    <TooltipWrapper
      tooltipContent={
        <div style={styles.container}>
          <div style={styles.title}>{level.name}</div>
          <div>lvl. {level.realLevelNumber}</div>
          <div>
            from {level.minimumPoints.toFixed(2)} to{" "}
            {level.maximumPoints.toFixed(2)} points
          </div>
        </div>
      }
    >
      <Avatar
        id={level.imageId}
        size={size}
        disabled={disabled}
        shadow={shadow}
      />
    </TooltipWrapper>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    fontWeight: "bold",
  },
};