import { Styles } from "../../utils/Styles";
import { HallOfFameMenu } from "../../components/hallOfFame/HallOfFameMenu";
import { useHallOfFameData } from "../../hooks/HallOfFame/useHallOfFameData";
import { Podium } from "../../components/hallOfFame/Podium/Podium";
import { useCallback, useEffect, useState } from "react";
import { StudentCardsList } from "../../components/hallOfFame/StudentCardsList";
import { isPartOfAString } from "../../utils/strings";
import { HALL_OF_FAME_STUDENT_CARD_ID_PREFIX } from "../../components/hallOfFame/HallOfFameStudentCard";
import { CONTENT_CONTAINER_HEIGHT } from "../../components/layout/ScreenContentContainer";

export const HallOfFame = () => {
  const { isUserRoleStudent, students, highlightedStudent, loading, error } =
    useHallOfFameData();
  const [showStudentsFromAllGroups, setShowStudentsFromAllGroups] =
    useState(!isUserRoleStudent);
  const [searchInput, setSearchInput] = useState("");

  const scrollToStudent = useCallback(() => {
    const studentElement = document.getElementById(
      HALL_OF_FAME_STUDENT_CARD_ID_PREFIX + highlightedStudent?.id,
    );
    if (studentElement) {
      studentElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightedStudent?.id]);

  useEffect(() => {
    if (highlightedStudent?.id) {
      scrollToStudent();
    }
  }, [scrollToStudent, highlightedStudent?.id, showStudentsFromAllGroups]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const displayStudents = showStudentsFromAllGroups
    ? students
    : students
        .filter((student) => student.groupId === highlightedStudent?.groupId)
        .map((student, index) => {
          return { ...student, position: index + 1 };
        }) ?? [];

  return (
    <div style={styles.container}>
      <div style={styles.leftSide}>
        <Podium students={displayStudents} />
      </div>

      <div style={styles.sideBarContainer}>
        <HallOfFameMenu
          students={displayStudents}
          onShowStudentsFromAllGroupsChange={(
            showAllGroupsStudents: boolean,
          ) => {
            setShowStudentsFromAllGroups(showAllGroupsStudents);
          }}
          showStudentsFromAllGroups={showStudentsFromAllGroups}
          onSearchChange={(input: string) => {
            setSearchInput(input);
          }}
          scrollToStudent={scrollToStudent}
          isUserRoleStudent={isUserRoleStudent}
        />
        <StudentCardsList
          students={displayStudents.filter((s) =>
            isPartOfAString(searchInput, [s.nick]),
          )}
          highlightedStudent={highlightedStudent}
        />
      </div>
    </div>
  );
};

const styles: Styles = {
  container: {
    position: "relative",
    display: "flex",
    height: CONTENT_CONTAINER_HEIGHT,
  },
  leftSide: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  sideBarContainer: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "grey",
    minWidth: 720,
  },
};
