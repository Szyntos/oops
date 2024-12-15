import { useLevelsData } from "../../../../hooks/StudentProfile/useLevelsData";
import { NeighboringLevel } from "../../../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { CustomImageList } from "../ImageList";

type LevelsSectionProps = {
  studentLevel: NeighboringLevel;
  currLevel: NeighboringLevel;
};

export const LevelsSection = ({
  studentLevel,
  currLevel,
}: LevelsSectionProps) => {
  const { levels, loading, error } = useLevelsData();

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <CustomImageList
      items={levels.map((level) => ({
        level,
        disabled: level.ordinalNumber > studentLevel.ordinalNumber,
        current: currLevel.ordinalNumber === level.ordinalNumber,
        type: "animal",
      }))}
      type="animal"
    />
  );
};
