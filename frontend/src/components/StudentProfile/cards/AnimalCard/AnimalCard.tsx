import { Styles } from "../../../../utils/Styles";
import { Avatar } from "../../../images/Avatar";
import { LevelsSection } from "./LevelsSection";
import { LevelProgressBar } from "../../../bars/LevelProgressBar/LevelProgressBar";
import { NeighboringLevel } from "../../../../hooks/StudentProfile/useStudentProfileData/useAnimalData";

type AnimalCardProps = {
  prevLevel: NeighboringLevel | undefined;
  currLevel: NeighboringLevel;
  nextLevel: NeighboringLevel | undefined;
  totalPoints: number;
};

export const AnimalCard = ({
  currLevel,
  prevLevel,
  nextLevel,
  totalPoints,
}: AnimalCardProps) => {
  return (
    <div style={styles.card}>
      <Avatar id={currLevel.imageFile?.fileId} size="l" />
      <div style={styles.title}>
        obecny level: {currLevel.levelName} - lvl. {currLevel.ordinalNumber + 1}
      </div>
      <LevelProgressBar
        totalPoints={totalPoints}
        prevLevel={prevLevel}
        currLevel={currLevel}
        nextLevel={nextLevel}
      />
      <LevelsSection studentLevel={currLevel} />
    </div>
  );
};

const styles: Styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid blue",
    gap: 12,
    padding: 24,
  },
  title: {
    fontWeight: "bold",
  },
};
