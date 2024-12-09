import { TooltipWrapper } from "../TooltipWrapper";
import { Styles } from "../../utils/Styles";
import { Avatar } from "./Avatar";
import { Level } from "../../hooks/StudentProfile";
import { ImageSize } from "./CustomImage";

type AnimalWithTooltipProps = {
  level: Level;
  size: ImageSize;
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
