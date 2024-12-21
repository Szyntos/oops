import { useState } from "react";
import { PointsRow, PointsRowData } from "./PointsRow";
import { formStyles, Subcategory } from "../../utils/utils";
import { FormError } from "../form/FormError";
import { FormButton } from "../form/FormButton";

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
    <div style={formStyles.formContainer}>
      <div style={formStyles.fieldsContainer}>
        {rows.map((row, index) => (
          <PointsRow
            key={row.student.id}
            data={row}
            onPointsChange={handlePointsChange}
            maxPoints={subcategory.maxPoints}
            ordinal={index + 1}
          />
        ))}
        <FormError error={formError} />
        <FormButton onClick={() => handleAdd(rows)} />
      </div>
    </div>
  );
};
