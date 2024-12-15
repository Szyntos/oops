import { useUser } from "../../hooks/common/useUser";
import { useStudentProfileData } from "../../hooks/StudentProfile";
import { SideBar } from "../../components/StudentProfile/SideBar";
import { StudentTableWithFilters } from "../../components/StudentProfile/table/StudentTableWithFilters";
import { ScreenContentContainer } from "../../components/layout/ScreenContentContainer";

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

  if (loading) return <p>Ładowanie...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!studentData) return <p>Student nie jest zdefiniowany</p>;
  if (!currLevel) return <p>Obecny poziom nie jest zdefiniowany</p>;

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
