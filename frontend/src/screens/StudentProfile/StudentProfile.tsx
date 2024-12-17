import { useUser } from "../../hooks/common/useUser";
import { useStudentProfileData } from "../../hooks/StudentProfile";
import { SideBar } from "../../components/StudentProfile/SideBar";
import { StudentTableWithFilters } from "../../components/StudentProfile/table/StudentTableWithFilters";
import { ScreenContentContainer } from "../../components/layout/ScreenContentContainer";
import { LoadingScreen } from "../Loading/LoadingScreen";
import { ErrorScreen } from "../Error/ErrorScreen";

export function StudentProfile() {
  const { user } = useUser();
  const {
    categories,
    studentData,
    points,
    sumOfAllPoints,
    prevLevel,
    currLevel,
    nextLevel,
    bonuses,
    filterHeaderNames,
    loading,
    error,
  } = useStudentProfileData(user.userId);

  // TODO: add components for loading state and error message

  if (loading) return <LoadingScreen />;
  if (error || !studentData || !currLevel) return <ErrorScreen />;

  return (
    <ScreenContentContainer
      sidebar={
        <SideBar
          student={studentData}
          categoriesBarProps={categories}
          sumOfAllPoints={sumOfAllPoints}
          prevLevel={prevLevel}
          currLevel={currLevel}
          nextLevel={nextLevel}
          bonuses={bonuses}
        />
      }
    >
      <StudentTableWithFilters
        points={points}
        filterHeaderNames={filterHeaderNames}
      />
    </ScreenContentContainer>
  );
}
