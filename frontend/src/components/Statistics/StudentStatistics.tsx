import { useHallOfFameData } from "../../hooks/HallOfFame/useHallOfFameData";
import { ErrorScreen } from "../../screens/Error/ErrorScreen";
import { LoadingScreen } from "../../screens/Loading/LoadingScreen";
import { Styles } from "../../utils/Styles";
import { StatisticsCard } from "./StatisticsCard";
import { CONTENT_CONTAINER_HEIGHT_CALC } from "../layout/ScreenContentContainer";

export const StudentStatistics = () => {
  const { students, loading, error, groupedStudents, highlightedStudent } =
    useHallOfFameData();

  const studentGroupId = highlightedStudent?.groupId ?? "";

  if (loading) return <LoadingScreen />;
  if (error || students.length === 0) return <ErrorScreen />;

  return (
    <div style={styles.container}>
      <>
        {groupedStudents[studentGroupId].length > 0 && (
          <StatisticsCard
            title={groupedStudents[studentGroupId][0].groupName}
            key={studentGroupId}
            students={groupedStudents[studentGroupId] ?? []}
            highlightedStudent={highlightedStudent}
            highlight={false}
          />
        )}

        {students.length && (
          <StatisticsCard
            title={`Wszystkie grupy`}
            key={"all"}
            students={students}
            highlightedStudent={highlightedStudent}
            highlight={true}
          />
        )}
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
