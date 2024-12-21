import { useHallOfFameData } from "../../hooks/HallOfFame/useHallOfFameData";
import { ErrorScreen } from "../../screens/Error/ErrorScreen";
import { LoadingScreen } from "../../screens/Loading/LoadingScreen";
import { Styles } from "../../utils/Styles";
import { StatisticsCard } from "./StatisticsCard";
import { CONTENT_CONTAINER_HEIGHT_CALC } from "../layout/ScreenContentContainer";

export const StudentStatistics = () => {
  const { students, loading, error, groupedStudents, highlightedStudent } =
    useHallOfFameData();

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;

  const studentGroupId = highlightedStudent?.groupId ?? "";

  return (
    <div style={styles.container}>
      <>
        <StatisticsCard
          title={`Grupa ${studentGroupId}`}
          key={studentGroupId}
          students={groupedStudents[studentGroupId] ?? []}
          highlightedStudent={highlightedStudent}
          highlight={false}
        />

        <StatisticsCard
          title={`Wszystkie grupy`}
          key={"all"}
          students={students}
          highlightedStudent={highlightedStudent}
          highlight={true}
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
