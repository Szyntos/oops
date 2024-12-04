import { Styles } from "../../utils/Styles";

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
  label?: string;
};

export const ProgressBar = ({
  points,
  bounds,
  thresholds,
  showPoints,
  label,
}: ProgressBarProps) => {
  if (points < 0) {
    throw new Error("Punkty nie mogą być ujemne.");
  }

  if (points < bounds.lower) {
    throw new Error("Punkty nie mogą być mniejsze nić ograniczenie dolne.");
  }

  const diff = bounds.lower;

  const calculatePercent = (p: number) => {
    if (p < bounds.lower) {
      throw new Error("Punkty poza określonym zakresem.");
    }
    return Math.min(
      Math.round(((p - diff) / (bounds.upper - diff)) * 100),
      100,
    );
  };

  const filledPercent = calculatePercent(points);

  return (
    <div style={styles.container}>
      {label && <div>{label}</div>}
      <div style={styles.empty}>
        {showPoints && (
          <div style={styles.pointsContainer}>
            {points.toFixed(2)}/{bounds.upper.toFixed(2)}
          </div>
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
                <div style={styles.thresholdLabel}>{threshold.label}</div>
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
    position: "relative",
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
  },
  thresholdLine: {
    position: "absolute",
    height: BAR_HEIGHT,
    width: 2,
    backgroundColor: "grey",
    bottom: 0,
  },
  thresholdLabel: {
    position: "absolute",
    top: "100%",
    transform: "translateX(-50%)",
    whiteSpace: "nowrap",
    marginTop: 4,
  },
};
