import { Level } from "../../hooks/StudentProfile";
import { Styles } from "../../utils/Styles";
import { HallOfFameStudentData } from "../hallOfFame/HallOfFameStudentCard";
import { StatisticsBox } from "../hallOfFame/StatisticsBox";
import { CONTENT_CONTAINER_HEIGHT_CALC } from "../layout/ScreenContentContainer";

type StudentStatisticsProps = {
  students: HallOfFameStudentData[];
  highlightedStudent?: HallOfFameStudentData | null;
  levels: Level[];
  groupedStudents: Record<string, HallOfFameStudentData[]>;
};
export const StudentStatistics = ({
  highlightedStudent,
  levels,
  groupedStudents,
  students,
}: StudentStatisticsProps) => {
  const studentGroupId = highlightedStudent?.groupId ?? "";

  return (
    <div style={styles.container}>
      <>
        <StatisticsBox
          title={`Grupa ${studentGroupId}`}
          key={studentGroupId}
          students={groupedStudents[studentGroupId] ?? []}
          highlightedStudent={highlightedStudent}
          levels={levels}
        />

        <StatisticsBox
          title={`Wszystkie grupy`}
          key={"all"}
          students={students}
          highlightedStudent={highlightedStudent}
          levels={levels}
        />
      </>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    height: CONTENT_CONTAINER_HEIGHT_CALC,
  },
};
