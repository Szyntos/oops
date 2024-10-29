import { useState } from "react";
import {
  Group,
  Student,
  useGroupsSection,
} from "../../../../../hooks/Edition/useGroupsSection";
import { Styles } from "../../../../../utils/Styles";
import {
  Dialog,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { CloseHeader } from "../../../../dialogs/CloseHeader";

type StudentRowProps = {
  student: Student;
  handleDelete: (student: Student) => void;
};

export const StudentRow = ({ student, handleDelete }: StudentRowProps) => {
  const { groups } = useGroupsSection(3);

  const [isOpen, setISOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
    undefined,
  );

  const handleGroupChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const id = event.target.value as string;
    const group = groups.find((g) => g.groupsId === id);
    setSelectedGroup(group);
  };

  return (
    <div style={styles.container}>
      <button onClick={() => handleDelete(student)}>-</button>
      <button onClick={() => setISOpen(true)}>change group</button>
      <div>{student.fullName}</div>

      <Dialog open={isOpen}>
        <CloseHeader onCloseClick={() => setISOpen(false)} />
        <div style={{ width: 200, marginTop: 200 }}>
          <FormControl fullWidth>
            <InputLabel>Group</InputLabel>
            <Select value={selectedGroup} onChange={() => handleGroupChange}>
              {groups.map((group) => (
                <MenuItem key={group.groupsId} value={group.groupsId}>
                  {group.generatedName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </Dialog>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
