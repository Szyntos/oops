import { useLevelsData } from "../../hooks/StudentProfile";
import { EMPTY_FIELD_STRING } from "../../utils/constants";
import { ProgressBar } from "./ProgressBar";

type CourseProgressBarProps = {
  totalPoints: number;
  title: string;
};

export const CourseProgressBar = ({
  totalPoints,
  title,
}: CourseProgressBarProps) => {
  const { levels, error, loading } = useLevelsData();

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  if (levels.length < 2) return <div>{EMPTY_FIELD_STRING}</div>;

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
      pointsColor="blue"
      barColor="violet"
    />
  );
};
