import { Level } from "../../../../hooks/StudentProfile";
import { useLevelsData } from "../../../../hooks/StudentProfile/useLevelsData";
import { NeighboringLevel } from "../../../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { AvatarShadowSize } from "../../../avatars/Avatar";
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

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  const getShadow = (level: Level): AvatarShadowSize => {
    if (level.name === levels[levels.length - 1].name) {
      return "big";
    }
    return level.name === currLevel.levelName ? "small" : "none";
  };

  return (
    <CustomImageList
      items={levels.map((level) => ({
        level,
        disabled: level.ordinalNumber > studentLevel.ordinalNumber,
        current: currLevel.ordinalNumber === level.ordinalNumber,
        type: "animal",
        shadow: getShadow(level),
      }))}
      type="animal"
    />
  );
};
