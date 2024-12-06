import { Styles } from "../../utils/Styles";
import { CustomText } from "../CustomText";

const BAR_HEIGHT = 24;

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
};

export const ProgressBar = ({
  points,
  bounds,
  thresholds,
  showPoints,
  title,
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
      {title && <CustomText>{title}</CustomText>}
      <div style={styles.empty}>
        {showPoints && (
          <CustomText style={styles.pointsContainer}>
            {points.toFixed(2)}/{bounds.upper.toFixed(2)}
          </CustomText>
        )}
        <div style={{ ...styles.filled, width: `${filledPercent}%` }} />

        {thresholds &&
          thresholds.length > 0 &&
          thresholds.map((threshold, index) => {
            return (
              <div
                key={index}
                style={{
                  ...styles.thresholdLine,
                  left: `${calculatePercent(threshold.points)}%`,
                }}
              >
                <CustomText style={styles.thresholdLabel}>
                  {threshold.label}
                </CustomText>
              </div>
            );
          })}
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
  empty: {
    height: BAR_HEIGHT,
    width: "100%",
    backgroundColor: "lightgrey",
    position: "relative", // Establish a containing block for positioned children
  },
  filled: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    backgroundColor: "lightblue",
  },
  pointsContainer: {
    position: "absolute",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    zIndex: 2,
  },
  thresholdLine: {
    position: "absolute",
    height: BAR_HEIGHT,
    width: 2,
    backgroundColor: "grey",
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
