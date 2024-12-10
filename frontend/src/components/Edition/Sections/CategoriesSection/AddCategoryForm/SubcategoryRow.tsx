import { z } from "zod";
import { Styles } from "../../../../../utils/Styles";
import { TextField } from "@mui/material";
import { useState } from "react";
import { tokens } from "../../../../../tokens";

export type SubcategoriesFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  name: z.string().min(1, "required"),
  maxPoints: z.number().min(1, ":("),
  ordinal: z.number(),
});

type SubcategoryRowProps = {
  initialValues: SubcategoriesFormValues;
  disabled?: boolean;
  blockUp?: boolean;
  blockDown?: boolean;
  handleAdd: (subcategory: SubcategoriesFormValues) => void;
  handleDelete: (ordinal: number) => void;
  handleUp: (ordinal: number) => void;
  handleDown: (ordinal: number) => void;
};

// TODO make all row editable -> support error messages

export const SubcategoryRow = ({
  initialValues,
  disabled = true,
  blockUp = false,
  blockDown = false,
  handleAdd,
  handleDelete,
  handleUp,
  handleDown,
}: SubcategoryRowProps) => {
  const [maxPoints, setMaxPoints] = useState<number>(initialValues.maxPoints);
  const [name, setName] = useState<string>(initialValues.name);

  return (
    <div style={styles.innerContainer}>
      <TextField
        name="ordinal"
        label="ord"
        variant="outlined"
        value={initialValues.ordinal}
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

      {disabled ? (
        <div>
          <button
            type="button"
            disabled={blockUp}
            onClick={() => handleUp(initialValues.ordinal)}
          >
            up
          </button>
          <button
            type="button"
            onClick={() => handleDown(initialValues.ordinal)}
            disabled={blockDown}
          >
            do
          </button>

          <button
            type="button"
            onClick={() => handleDelete(initialValues.ordinal)}
          >
            -
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            handleAdd({
              ordinal: initialValues.ordinal,
              maxPoints,
              name,
            });
          }}
        >
          +
        </button>
      )}
    </div>
  );
};

const styles: Styles = {
  innerContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    padding: 12,
    width: 500,
  },
  points: {
    width: 80,
  },
  title: {
    fontWeight: "bold",
  },
  error: {
    color: tokens.color.state.error,
  },
};
