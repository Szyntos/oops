import { useState } from "react";
import { PointsItem } from "../../hooks/Group/useGroupScreenData";
import { Styles } from "../../utils/Styles";
import { PointsRow } from "./PointsRow";

type GroupPointsForm = {
  rows: PointsItem[];
  handleAdd: (rows: PointsItem[]) => void;
  formError?: string;
  maxPoints: number;
  subcategoryName: string;
};

export const GroupPointsForm = ({
  handleAdd,
  rows,
  formError,
  maxPoints,
  subcategoryName,
}: GroupPointsForm) => {
  const [updatedRows, setUpdatedRows] = useState<PointsItem[]>(rows);

  const handlePointsChange = (studentId: string, newPoints: number | null) => {
    const updatedList = updatedRows.map((row) =>
      row.student.id === studentId
        ? { ...row, points: newPoints ?? undefined }
        : row,
    );
    setUpdatedRows(updatedList);
  };

  return (
    <div style={styles.container}>
      <div>
        <div style={styles.title}>Add points to {subcategoryName}</div>
        <div>max points: {maxPoints}</div>
      </div>

      <div style={styles.fieldsContainer}>
        {updatedRows.map((row, index) => (
          <PointsRow
            key={row.student.id}
            student={row.student}
            points={row.points}
            onUpdate={handlePointsChange}
            maxPoints={maxPoints}
            ordinal={index + 1}
          />
        ))}
      </div>

      {formError && <div style={styles.error}>Error: {formError}</div>}
      <button
        onClick={() => {
          handleAdd(updatedRows);
        }}
      >
        Add
      </button>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    padding: 20,
  },
  title: { fontWeight: "bold" },
  error: { color: "red" },
  fieldsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
};
