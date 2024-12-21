import { z } from "zod";
import { Styles } from "../../../../../utils/Styles";
import { TextField } from "@mui/material";
import { useState } from "react";
import { tokens } from "../../../../../tokens";
import { RowButton } from "./RowButton";

export type SubcategoriesFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  name: z.string().min(1, "required"),
  maxPoints: z.number().min(1, ":("),
  ordinal: z.number(),
});

type SubcategoryRowProps = {
  initialValues: SubcategoriesFormValues;
  variant: "edit" | "add";
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
  variant,
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
        variant="outlined"
        label="Lp."
        value={`${initialValues.ordinal}.`}
        style={styles.ordinal}
        disabled={true}
        size="small"
      />

      <TextField
        name="maxPoints"
        label="Max. punktów"
        variant="outlined"
        value={maxPoints}
        onChange={(e) => setMaxPoints(parseInt(e.target.value))}
        onBlur={() => {}}
        error={undefined}
        helperText={undefined}
        style={styles.maxPoints}
        type="number"
        disabled={variant === "edit"}
        size="small"
      />

      <TextField
        fullWidth
        name="name"
        label="Nazwa"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {}}
        error={undefined}
        helperText={undefined}
        disabled={variant === "edit"}
        size="small"
      />

      {variant === "edit" ? (
        <>
          <RowButton
            onClick={() => handleUp(initialValues.ordinal)}
            isDisabled={blockUp}
            icon="up"
          />
          <RowButton
            color={tokens.color.state.error}
            onClick={() => handleDelete(initialValues.ordinal)}
            isDisabled={false}
            icon="delete"
          />
          <RowButton
            onClick={() => handleDown(initialValues.ordinal)}
            isDisabled={blockDown}
            icon="down"
          />
        </>
      ) : (
        <RowButton
          onClick={() => {
            handleAdd({
              ordinal: initialValues.ordinal,
              maxPoints,
              name,
            });
          }}
          isDisabled={false}
          icon="add"
        />
      )}
    </div>
  );
};

const styles: Styles = {
  innerContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  ordinal: {
    maxWidth: 52,
  },
  maxPoints: {
    maxWidth: 110,
  },
};
