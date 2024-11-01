import { Styles } from "../../../../../utils/Styles";
import { TextField } from "@mui/material";
import { useState } from "react";
import { Image } from "../../../../images/Image";

export type RowLevel = {
  name: string;
  maxPoints: number;
  grade: string;
  imageId?: string;
};

type LevelRowProps = {
  initialValues: RowLevel;
  minPoints?: number;
  ordinal?: number;
  blockUp?: boolean;
  blockDown?: boolean;
  handleAdd: (level: RowLevel) => void;
  handleDelete: (ordinal: number) => void;
  handleUp: (ordinal: number) => void;
  handleDown: (ordinal: number) => void;
  varinat: "add" | "display";
};

// TODO make all row editable -> support error messages

export const LevelRow = ({
  initialValues,
  ordinal,
  minPoints,
  blockUp = false,
  blockDown = false,
  handleAdd,
  handleDelete,
  handleUp,
  handleDown,
  varinat,
}: LevelRowProps) => {
  const [maxPoints, setMaxPoints] = useState<number>(initialValues.maxPoints);
  const [name, setName] = useState<string>(initialValues.name);
  const [grade, setGrade] = useState<string>(initialValues.grade);

  return (
    <div style={styles.innerContainer}>
      {varinat === "display" && (
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
        error={undefined}
        helperText={undefined}
        style={styles.points}
        type="number"
        disabled={varinat === "display"}
      />

      <TextField
        name="name"
        label="name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {}}
        error={undefined}
        helperText={undefined}
        style={styles.number}
        disabled={varinat === "display"}
      />

      <TextField
        name="grade"
        label="grade"
        variant="outlined"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        onBlur={() => {}}
        error={undefined}
        helperText={undefined}
        style={styles.number}
        disabled={varinat === "display"}
      />

      <div>
        {varinat === "display" && ordinal && (
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
            <button type="button" onClick={() => handleDelete(ordinal)}>
              -
            </button>
          </div>
        )}

        {varinat === "add" && (
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
};
