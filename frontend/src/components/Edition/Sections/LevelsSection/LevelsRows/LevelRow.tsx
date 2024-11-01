import { Styles } from "../../../../../utils/Styles";
import { TextField } from "@mui/material";
import { useState } from "react";

export type RowLevel = {
  name: string;
  maxPoints: number;
  grade: string;
};

type LevelRowProps = {
  initialValues: RowLevel;
  ordinal?: number;
  blockUp?: boolean;
  blockDown?: boolean;
  handleAdd: (level: RowLevel) => void;
  handleDelete: (ordinal: number) => void;
  handleUp: (ordinal: number) => void;
  handleDown: (ordinal: number) => void;
  display: {
    direction: boolean;
    add: boolean;
    delete: boolean;
  };
  disabled?: boolean;
};

// TODO make all row editable -> support error messages

export const LevelRow = ({
  initialValues,
  ordinal,
  blockUp = false,
  blockDown = false,
  handleAdd,
  handleDelete,
  handleUp,
  handleDown,
  display,
  disabled = false,
}: LevelRowProps) => {
  const [maxPoints, setMaxPoints] = useState<number>(initialValues.maxPoints);
  const [name, setName] = useState<string>(initialValues.name);
  const [grade, setGrade] = useState<string>(initialValues.grade);

  return (
    <div style={styles.innerContainer}>
      <TextField
        name="ordinal"
        label="ordinal"
        variant="outlined"
        value={ordinal ?? "?"}
        style={styles.points}
        disabled={true}
      />

      <TextField
        name="maxPoints"
        label="max"
        variant="outlined"
        value={maxPoints}
        onChange={(e) => setMaxPoints(parseInt(e.target.value))}
        onBlur={() => {}}
        error={undefined}
        helperText={undefined}
        style={styles.points}
        type="number"
        disabled={disabled}
      />

      <TextField
        fullWidth
        name="name"
        label="name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {}}
        error={undefined}
        helperText={undefined}
        style={styles.number}
        disabled={disabled}
      />

      <TextField
        fullWidth
        name="grade"
        label="grade"
        variant="outlined"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        onBlur={() => {}}
        error={undefined}
        helperText={undefined}
        style={styles.number}
        disabled={disabled}
      />

      <div>
        {display.direction && ordinal && (
          <div>
            <button
              type="button"
              onClick={() => handleUp(ordinal)}
              disabled={blockUp}
            >
              up
            </button>
            <button
              type="button"
              onClick={() => handleDown(ordinal)}
              disabled={blockDown}
            >
              do
            </button>
          </div>
        )}
        {display.delete && ordinal && (
          <button type="button" onClick={() => handleDelete(ordinal)}>
            -
          </button>
        )}
        {display.add && (
          <button
            type="button"
            onClick={() =>
              handleAdd({
                name,
                grade,
                maxPoints,
              })
            }
          >
            +
          </button>
        )}
      </div>
    </div>
  );
};

const styles: Styles = {
  innerContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
  points: {
    width: 200,
  },
  title: { fontWeight: "bold" },
  error: { color: "red" },
};
