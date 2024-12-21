import { Tooltip } from "@mui/material";
import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";
import { getLinearGradient } from "../../utils/utils";
import { CustomText } from "../CustomText";

const BAR_HEIGHT = 20;
const BORDER_RADIUS = 4;

const TRIANGLE_WIDTH = 16;
const TRIANGLE_HEIGHT = 10;

type BarThreshold = {
  label?: string;
  points: number;
};

export type ProgressBarProps = {
  points: number;
  bounds: { lower: number; upper: number };
  thresholds?: BarThreshold[];
  showPoints?: boolean;
  title?: string;
  lightColor?: string;
  darkColor?: string;
};

export const ProgressBar = ({
  points,
  bounds,
  thresholds,
  showPoints,
  title,
  lightColor = tokens.color.accent.dark,
  darkColor = tokens.color.accent.light,
}: ProgressBarProps) => {
  if (points < 0) {
    console.error("Punkty nie mogą być ujemne.");
  }
  if (points < bounds.lower) {
    console.error("Punkty nie mogą być mniejsze nić ograniczenie dolne.");
  }

  const diff = bounds.lower;

  const calculatePercent = (p: number) => {
    return Math.min(
      Math.round(((p - diff) / (bounds.upper - diff)) * 100),
      100,
    );
  };

  const filledPercent = calculatePercent(points);

  return (
    <div style={styles.container}>
      {title && <CustomText style={styles.title}>{title}</CustomText>}

      <div style={styles.empty}>
        {showPoints && (
          <CustomText
            style={styles.pointsTextContainer}
            size={tokens.font.small}
          >
            {points.toFixed(2)}/{bounds.upper.toFixed(2)}
          </CustomText>
        )}
        <div
          style={{
            ...styles.filled,
            width: `${filledPercent}%`,
            background: getLinearGradient(darkColor, lightColor),
            borderTopRightRadius: filledPercent === 100 ? BORDER_RADIUS : 0,
            borderBottomRightRadius: filledPercent === 100 ? BORDER_RADIUS : 0,
          }}
        />

        {thresholds &&
          thresholds.length > 0 &&
          thresholds.map((threshold, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${calculatePercent(threshold.points)}%`,
              }}
            >
              <Tooltip placement="top" title={`lvl. ${threshold.label}`}>
                <div style={styles.thresholdLine} />
              </Tooltip>
            </div>
          ))}
      </div>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    paddingLeft: 0,
  },
  empty: {
    height: BAR_HEIGHT,
    backgroundColor: tokens.color.state.disabled,
    borderRadius: BORDER_RADIUS,
    position: "relative",
  },
  filled: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    backgroundColor: tokens.color.accent.dark,
    borderTopLeftRadius: BORDER_RADIUS,
    borderBottomLeftRadius: BORDER_RADIUS,
  },
  pointsTextContainer: {
    position: "absolute",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    marginLeft: 4,
  },
  thresholdLine: {
    borderLeft: `${TRIANGLE_WIDTH / 2}px solid transparent`,
    borderRight: `${TRIANGLE_WIDTH / 2}px solid transparent`,
    borderTop: `${TRIANGLE_HEIGHT}px solid ${tokens.color.state.error}`,
    position: "absolute",
    transform: "translateX(-50%)",
    bottom: BAR_HEIGHT - TRIANGLE_HEIGHT + 2,
  },
};
