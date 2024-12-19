import { Student } from "../../../../../hooks/Edition/useGroupsSection";
import { Styles } from "../../../../../utils/Styles";
import { CustomText } from "../../../../CustomText";
import { RowButton } from "../../CategoriesSection/AddCategoryForm/RowButton";

type StudentRowProps = {
  student: Student;
  handleDelete: (student: Student) => void;
  ordinal: number;
};

export const StudentRow = ({
  student,
  handleDelete,
  ordinal,
}: StudentRowProps) => {
  return (
    <div style={styles.container}>
      <RowButton
        onClick={() => handleDelete(student)}
        isDisabled={false}
        icon={"delete"}
      />
      <CustomText>
        {ordinal + 1}. {student.firstName} {student.secondName}
      </CustomText>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
};
