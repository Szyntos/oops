import { Level } from "../../hooks/StudentProfile";
import { HallOfFameStudentData } from "./HallOfFameStudentCard";
import { StatisticsBox } from "./StatisticsBox";

type StatisticsListProps = {
  highlightedStudent?: HallOfFameStudentData | null;
  levels: Level[];
  groupedStudents: Record<string, HallOfFameStudentData[]>;
  role: "student" | "teacher" | "coordinator";
};

export const StatisticsList = ({
  highlightedStudent,
  levels,
  groupedStudents,
  role,
}: StatisticsListProps) => {
  if (role !== "student") {
    return <></>;
  }

  // If there is a highlighted student, display their group first, then the rest of the groups
  const highlightedGroupId = highlightedStudent?.groupId ?? "";

  // Create a new array of groupIds, ensuring highlighted group is first
  const groupIds = Object.keys(groupedStudents);

  // If there is a highlighted group, move it to the beginning of the array
  if (highlightedGroupId) {
    const highlightedGroupIndex = groupIds.indexOf(highlightedGroupId);
    if (highlightedGroupIndex > -1) {
      groupIds.splice(highlightedGroupIndex, 1);
      groupIds.unshift(highlightedGroupId); // Move the highlighted group to the front
    }
  }

  return (
    <div>
      {groupIds.map((groupId) => (
        <StatisticsBox
          title={`grupa ${groupId}`}
          key={groupId}
          students={groupedStudents[groupId]}
          highlightedStudent={
            highlightedGroupId === groupId ? highlightedStudent : undefined
          }
          levels={levels}
        />
      ))}
    </div>
  );
};
