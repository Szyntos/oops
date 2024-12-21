import { useHallOfFameData } from "../../hooks/HallOfFame/useHallOfFameData";
import { ErrorScreen } from "../../screens/Error/ErrorScreen";
import { LoadingScreen } from "../../screens/Loading/LoadingScreen";
import { StudentStatistics } from "./StudentStatistics";

type StatisticsProps = {
  role: "student" | "teacher" | "coordinator";
};
export const Statistics = ({ role }: StatisticsProps) => {
  const {
    students,
    loading,
    error,
    levels,
    groupedStudents,
    highlightedStudent,
  } = useHallOfFameData();

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;

  console.log(groupedStudents);

  if (role === "student") {
    return (
      <StudentStatistics
        levels={levels}
        groupedStudents={groupedStudents}
        students={students}
        highlightedStudent={highlightedStudent}
      />
    );
  }

  return <div></div>;
};
