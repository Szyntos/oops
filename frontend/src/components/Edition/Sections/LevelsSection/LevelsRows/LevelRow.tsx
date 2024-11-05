import { Styles } from "../../../../../utils/Styles";
import {
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useState } from "react";
import { Image } from "../../../../images/Image";

export type RowLevel = {
  name: string;
  maxPoints: number;
  grade: string;
  imageId?: string;
};

const gradeOptions = ["2.0", "3.0", "3.5", "4.0", "4.5", "5.0"];

type LevelRowProps = {
  initialValues?: RowLevel;
  minPoints?: number;
  ordinal?: number;
  blockUp?: boolean;
  blockDown?: boolean;
  handleAdd: (level: RowLevel) => void;
  handleDelete: (ordinal: number) => void;
  handleUp: (ordinal: number) => void;
  handleDown: (ordinal: number) => void;
  variant: "add" | "display";
};

// TODO: Make all row editable -> support error messages

export const LevelRow = ({
  initialValues = {
    name: "",
    maxPoints: 0,
    grade: "2.0",
  },
  ordinal,
  minPoints,
  blockUp = false,
  blockDown = false,
  handleAdd,
  handleDelete,
  handleUp,
  handleDown,
  variant,
}: LevelRowProps) => {
  const [maxPoints, setMaxPoints] = useState<number>(initialValues.maxPoints);
  const [name, setName] = useState<string>(initialValues.name);
  const [grade, setGrade] = useState<string>(initialValues.grade);

  return (
    <div style={styles.innerContainer}>
      {variant === "display" && (
        <Image size={64} disabled={false} id={initialValues.imageId} />
      )}

      <TextField
        name="ordinal"
        label="ordinal"
        variant="outlined"
        value={ordinal ?? "?"}
        style={styles.points}
        disabled={true}
      />

      <TextField
        name="min"
        label="min"
        variant="outlined"
        value={minPoints ?? "?"}
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
        style={styles.points}
        type="number"
        disabled={variant === "display"}
      />

      <TextField
        name="name"
        label="name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {}}
        style={styles.number}
        disabled={variant === "display"}
      />

      <FormControl
        fullWidth
        style={styles.number}
        disabled={variant === "display"}
      >
        <InputLabel>Grade</InputLabel>
        <Select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          label="Grade"
        >
          {gradeOptions.map((gradeOption) => (
            <MenuItem key={gradeOption} value={gradeOption}>
              {gradeOption}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div>
        {variant === "display" && ordinal && (
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
              down
            </button>
            <button type="button" onClick={() => handleDelete(ordinal)}>
              -
            </button>
          </div>
        )}

        {variant === "add" && (
          <button
            type="button"
            onClick={() =>
              handleAdd({
                imageId: initialValues.imageId,
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
    width: 240,
  },
  title: { fontWeight: "bold" },
  error: { color: "red" },
  number: {
    width: 120,
  },
};
