import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";
import { getLinearGradient } from "../../utils/utils";
import { CustomText } from "../CustomText";

const BAR_HEIGHT = 20;
const BORDER_RADIUS = 4;

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
  lightColor = tokens.color.accent.light,
  darkColor = tokens.color.accent.dark,
}: ProgressBarProps) => {
  if (points < 0) {
    throw new Error("points cannot be a negative number");
  }

  if (points < bounds.lower) {
    throw new Error("points cannot be lower than the lower bound");
  }

  const diff = bounds.lower;

  const calculatePercent = (p: number) => {
    if (p < bounds.lower) {
      throw new Error("points out of bounds.");
    }
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
          <CustomText style={styles.pointsContainer} size={tokens.font.small}>
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
                ...styles.thresholdLine,
                left: `${calculatePercent(threshold.points)}%`,
              }}
            >
              <CustomText style={styles.thresholdLabel} size={tokens.font.tiny}>
                lvl.{threshold.label}
              </CustomText>
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
    paddingLeft: 2,
  },
  empty: {
    height: BAR_HEIGHT,
    width: "100%",
    backgroundColor: tokens.color.state.disabled,
    position: "relative",
    borderRadius: BORDER_RADIUS,
  },
  filled: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    backgroundColor: tokens.color.accent.light,
    borderTopLeftRadius: BORDER_RADIUS,
    borderBottomLeftRadius: BORDER_RADIUS,
  },
  pointsContainer: {
    position: "absolute",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    zIndex: 2,
    marginLeft: 4,
  },
  thresholdLine: {
    position: "absolute",
    height: BAR_HEIGHT,
    width: 2,
    backgroundColor: tokens.color.state.disabled,
    bottom: 0,
    zIndex: 1,
  },
  thresholdLabel: {
    position: "absolute",
    top: "100%",
    transform: "translateX(-50%)",
    whiteSpace: "nowrap",
    marginTop: 4,
    zIndex: 1,
  },
};
