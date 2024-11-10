import { NeighboringLevel } from "../../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { Styles } from "../../../utils/Styles";
import { ProgressBar } from "../ProgressBar";
import { LevelMiniature } from "./LevelMiniature";

type LevelProgressBarProps = {
  totalPoints: number | undefined;
  prevLevel: NeighboringLevel | undefined;
  currLevel: NeighboringLevel;
  nextLevel: NeighboringLevel | undefined;
};

export const LevelProgressBar = ({
  totalPoints,
  prevLevel,
  currLevel,
  nextLevel,
}: LevelProgressBarProps) => {
  const leftLevel = prevLevel ?? currLevel;
  const rightLevel = nextLevel ?? currLevel;
  return (
    <div style={styles.container}>
      <ProgressBar
        points={
          totalPoints ? totalPoints - parseFloat(currLevel.minimumPoints) : 0
        }
        bounds={{
          lower: 0,
          upper:
            parseFloat(currLevel.maximumPoints) -
            parseFloat(currLevel.minimumPoints),
        }}
        showPoints
      />

      <div style={styles.levelMiniaturesContainer}>
        <LevelMiniature level={leftLevel} />
        <LevelMiniature
          level={rightLevel}
          disabled={rightLevel !== currLevel}
        />
      </div>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    gap: 12,
    flexDirection: "column",
  },
  levelMiniaturesContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
};
