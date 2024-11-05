import { NeighboringLevel } from "../../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { Avatar } from "../../images/Avatar";

type LevelMiniatureProps = {
  level: NeighboringLevel;
  disabled?: boolean;
};

export const LevelMiniature = ({
  level,
  disabled = false,
}: LevelMiniatureProps) => {
  return (
    <div>
      <Avatar id={level.imageFile?.fileId} size="s" disabled={disabled} />
      <div>lvl. {level.ordinalNumber + 1}</div>
    </div>
  );
};
