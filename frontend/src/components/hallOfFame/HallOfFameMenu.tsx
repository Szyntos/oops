import { Styles } from "../../utils/Styles";
import { HallOfFameStudentData } from "./HallOfFameStudentCard";
import { HallOfFameStudentSearcher } from "./HallOfFameStudentSearcher";
import { FilterButton } from "../FilterButton";

type HallOfFameMenuProps = {
  students: HallOfFameStudentData[];
  showStudentsFromAllGroups: boolean;
  onShowStudentsFromAllGroupsChange: (showAllStudents: boolean) => void;
  onSearchChange: (input: string) => void;
  scrollToStudent: () => void;
  isUserRoleStudent: boolean;
};

export const HallOfFameMenu = ({
  onShowStudentsFromAllGroupsChange,
  showStudentsFromAllGroups,
  onSearchChange,
  scrollToStudent,
  isUserRoleStudent,
}: HallOfFameMenuProps) => {
  return (
    <div style={styles.container}>
      {isUserRoleStudent ? (
        <>
          <button onClick={scrollToStudent}>znajdź swoją pozycję</button>
          <HallOfFameStudentSearcher onInputChange={onSearchChange} />
          <FilterButton
            option={"Moja grupa"}
            isActive={!showStudentsFromAllGroups}
            onClick={() => onShowStudentsFromAllGroupsChange(false)}
          />
          <FilterButton
            option={"Wszystkie grupy"}
            isActive={showStudentsFromAllGroups}
            onClick={() => onShowStudentsFromAllGroupsChange(true)}
          />
        </>
      ) : (
        <HallOfFameStudentSearcher onInputChange={onSearchChange} />
      )}
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    gap: 12,
    padding: 12,
    backgroundColor: "lightgrey",
  },
};
