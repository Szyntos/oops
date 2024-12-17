import { useLevelsData } from "../../hooks/StudentProfile";
import { EMPTY_FIELD_STRING } from "../../utils/constants";
import { ProgressBar } from "./ProgressBar";
import { CustomText } from "../CustomText";
import { ERROR_MESSAGE } from "../../utils/utils";

type CourseProgressBarProps = {
  totalPoints: number;
  title: string;
};

export const CourseProgressBar = ({
  totalPoints,
  title,
}: CourseProgressBarProps) => {
  const { levels, error, loading } = useLevelsData();

  if (loading) return <></>;
  if (error) return <CustomText>{ERROR_MESSAGE}</CustomText>;

  if (levels.length < 2) return <CustomText>{EMPTY_FIELD_STRING}</CustomText>;

  const upperBound = levels[levels.length - 1].maximumPoints;

  return (
    <ProgressBar
      points={totalPoints}
      bounds={{ lower: 0, upper: upperBound }}
      thresholds={levels.slice(1).map((level) => {
        return {
          label: level.realLevelNumber.toString(),
          points: level.minimumPoints,
        };
      })}
      showPoints={true}
      title={title}
    />
  );
};
