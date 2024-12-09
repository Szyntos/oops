import { NeighboringLevel } from "../../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { AnimalWithTooltip } from "../../avatars/AnimalWithTooltip";

type LevelMiniatureProps = {
  level: NeighboringLevel;
  disabled?: boolean;
};

export const LevelMiniature = ({ level }: LevelMiniatureProps) => {
  return (
    <div>
      <AnimalWithTooltip
        size={"s"}
        level={{
          name: level.levelName,
          ordinalNumber: level.ordinalNumber,
          realLevelNumber: level.ordinalNumber + 1,
          imageId: level.imageFile?.fileId,
          minimumPoints: parseFloat(level.minimumPoints),
          maximumPoints: parseFloat(level.maximumPoints),
        }}
      />
    </div>
  );
};
