import { useLevelsData } from "../../../../hooks/StudentProfile/useLevelsData";
import { NeighboringLevel } from "../../../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { CustomImageList } from "../ImageList";

type LevelsSectionProps = {
  studentLevel: NeighboringLevel;
};

export const LevelsSection = ({ studentLevel }: LevelsSectionProps) => {
  const { levels, loading, error } = useLevelsData();

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <CustomImageList
      items={levels.map((level) => ({
        level,
        disabled: level.ordinalNumber > studentLevel.ordinalNumber,
        type: "animal",
      }))}
      type="animal"
    />
  );
};
