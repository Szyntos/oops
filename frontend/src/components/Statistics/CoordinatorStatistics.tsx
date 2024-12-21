import { useHallOfFameDataTeacher } from "../../hooks/HallOfFame/useHallOfFameDataTeacher";
import { ErrorScreen } from "../../screens/Error/ErrorScreen";
import { LoadingScreen } from "../../screens/Loading/LoadingScreen";
import { Styles } from "../../utils/Styles";
import { StatisticsCard } from "./StatisticsCard";

export const CoordinatorStatistics = () => {
  const { students, loading, error, groupedStudents } =
    useHallOfFameDataTeacher();

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;

  const groupIds = Object.keys(groupedStudents);

  return (
    <div style={styles.container}>
      <StatisticsCard
        title={`Wszystkie grupy`}
        key={"all"}
        students={students}
        highlight={true}
      />

      {groupIds.map((groupId) => (
        <StatisticsCard
          title={`Grupa ${groupId}`}
          key={groupId}
          students={groupedStudents[groupId] ?? []}
          highlight={false}
        />
      ))}
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
    padding: 20,
  },
};
