import { Avatar } from "../../../images/Avatar";
import { LevelsSection } from "./LevelsSection";
import { LevelProgressBar } from "../../../bars/LevelProgressBar/LevelProgressBar";
import { NeighboringLevel } from "../../../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { Card } from "../Card/Card";
import { CustomText } from "../../../CustomText";

type AnimalCardProps = {
  totalPoints: number | undefined;
  prevLevel: NeighboringLevel | undefined;
  currLevel: NeighboringLevel;
  nextLevel: NeighboringLevel | undefined;
};

export const AnimalCard = ({
  currLevel,
  prevLevel,
  nextLevel,
  totalPoints,
}: AnimalCardProps) => {
  return (
    <Card>
      <div>
        <Avatar id={currLevel.imageFile?.fileId} size="l" />
        <CustomText>
          {currLevel.levelName} - lvl. {currLevel.ordinalNumber + 1}
        </CustomText>
        <LevelProgressBar
          totalPoints={totalPoints}
          prevLevel={prevLevel}
          currLevel={currLevel}
          nextLevel={nextLevel}
        />
      </div>
      <LevelsSection studentLevel={currLevel} />
    </Card>
  );
};
