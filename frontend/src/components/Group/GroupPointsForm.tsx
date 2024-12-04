import { useState } from "react";
import { Styles } from "../../utils/Styles";
import { PointsRow, PointsRowData } from "./PointsRow";
import { Subcategory } from "../../utils/utils";

type GroupPointsForm = {
  initialRows: PointsRowData[];
  handleAdd: (rows: PointsRowData[]) => void;
  formError?: string;
  subcategory: Subcategory;
};

export const GroupPointsForm = ({
  handleAdd,
  initialRows,
  formError,
  subcategory,
}: GroupPointsForm) => {
  const [rows, setRows] = useState<PointsRowData[]>(initialRows);

  const handlePointsChange = (data: PointsRowData) => {
    const updatedRows = rows.map((row) =>
      row.student.id === data.student.id
        ? { ...row, points: data.points }
        : row,
    );
    setRows(updatedRows);
  };

  return (
    <div style={styles.container}>
      <div>
        <div style={styles.title}>Dodaj punkty do {subcategory.name}</div>
        <div>Max punkty: {subcategory.maxPoints}</div>
      </div>

      <div style={styles.fieldsContainer}>
        {rows.map((row, index) => (
          <PointsRow
            key={row.student.id}
            data={row}
            onPointsChange={handlePointsChange}
            maxPoints={subcategory.maxPoints}
            ordinal={index + 1}
          />
        ))}
      </div>

      {formError && <div style={styles.error}>Error: {formError}</div>}
      <button
        onClick={() => {
          handleAdd(rows);
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
  title: {
    fontWeight: "bold",
  },
  pointsRowContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  error: {
    color: "red",
  },
};
