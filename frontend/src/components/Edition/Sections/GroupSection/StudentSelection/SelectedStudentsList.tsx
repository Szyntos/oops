import { Student } from "../../../../../hooks/Edition/useGroupsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { formStyles } from "../../../../../utils/utils";
import { CustomText } from "../../../../CustomText";
import { StudentRow } from "./StudentRow";

type SelectedStudentsProps = {
  students: Student[];
  handleDelete: (student: Student) => void;
  title: string;
};

export const SelectedStudentsList = ({
  students,
  handleDelete,
  title,
}: SelectedStudentsProps) => {
  return (
    <div>
      <CustomText style={formStyles.label}>{title}</CustomText>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {students.length > 0 ? (
          students
            .slice()
            .sort((a, b) => {
              return (a.fullName ?? "").localeCompare(b.fullName ?? "");
            })
            .map((s, index) => (
              <StudentRow
                student={s}
                handleDelete={handleDelete}
                ordinal={index}
              />
            ))
        ) : (
          <CustomText>{EMPTY_FIELD_STRING}</CustomText>
        )}
      </div>
    </div>
  );
};
