import { useState } from "react";
import { Styles } from "../../../../../utils/Styles";
import { AddedLevel } from "./LevelRow";
import { AddedLevels } from "./AddedLevels";
import { AddLevelForm, LevelFormValues } from "./AddLevelForm";

export type AddSetFormProps = {
  initLevels: AddedLevel[];
  formError?: string;
  handleConfirm: (levels: AddedLevel[]) => void;
  imageIds: string[];
};

export type WithAddedLevelsValidateErrors = {
  nameError: string | undefined;
  maxPointsError: string | undefined;
  gradeError: string | undefined;
};

export const AddSetForm = ({
  initLevels,
  formError,
  handleConfirm,
  imageIds,
}: AddSetFormProps) => {
  const [levels, setLevels] = useState<AddedLevel[]>(initLevels);

  const handleAdd = (values: LevelFormValues) => {
    const updatedRows: AddedLevel[] = [
      ...levels,
      {
        ...values,
      } as AddedLevel,
    ]
      .sort((a, b) => a.maxPoints - b.maxPoints)
      .map((l, index) => ({ ...l, ordinal: index }));

    const index = updatedRows.findIndex((l) => l.name === values.name);

    // update minimum points
    if (index === 0) {
      updatedRows[index].minPoints = 0;
    } else {
      updatedRows[index].minPoints = updatedRows[index - 1].maxPoints;
    }
    if (index !== updatedRows.length - 1) {
      updatedRows[index + 1].minPoints = updatedRows[index].maxPoints;
    }

    setLevels(updatedRows);
  };

  const handleDelete = (ordinal: number) => {
    const updatedRows = levels
      .filter((_, index) => index !== ordinal)
      .map((row, index) => {
        return { ...row, ordinal: index };
      });
    setLevels(updatedRows);
  };

  const handleUp = (ordinal: number) => {
    const beforeLvl = levels[ordinal - 1];
    const toMoveLvl = levels[ordinal];
    const updated = [...levels];

    updated[ordinal - 1] = {
      ...beforeLvl,
      name: toMoveLvl.name,
      imageId: toMoveLvl.imageId,
    };
    updated[ordinal] = {
      ...toMoveLvl,
      name: beforeLvl.name,
      imageId: beforeLvl.imageId,
    };

    setLevels(updated);
  };

  const handleDown = (ordinal: number) => {
    const afterLvl = levels[ordinal + 1];
    const toMoveLvl = levels[ordinal];
    const updated = [...levels];

    updated[ordinal] = {
      ...toMoveLvl,
      name: afterLvl.name,
      imageId: afterLvl.imageId,
    };

    updated[ordinal + 1] = {
      ...afterLvl,
      name: toMoveLvl.name,
      imageId: toMoveLvl.imageId,
    };

    setLevels(updated);
  };

  const validateWithAddedLevels = (
    values: LevelFormValues,
  ): WithAddedLevelsValidateErrors => {
    // check if name not duplicated
    const nameError = levels.find((l) => l.name === values.name)
      ? "duplicated name"
      : undefined;

    // check if max points not duplicated
    const maxPointsError = levels.find((l) => l.maxPoints === values.maxPoints)
      ? "duplicated maxPoints"
      : undefined;

    // TODO: check if grade is consistent
    let gradeError: string | undefined;

    return {
      nameError,
      maxPointsError,
      gradeError,
    };
  };

  return (
    <div style={styles.container}>
      <AddedLevels
        levels={levels}
        handleUp={handleUp}
        handleDown={handleDown}
        handleDelete={handleDelete}
      />
      <AddLevelForm
        handleAdd={handleAdd}
        title={"Add level form"}
        imageIds={imageIds}
        validateWithAddedLevels={validateWithAddedLevels}
      />
      <button
        onClick={() => handleConfirm(levels)}
        disabled={levels.length === 0}
      >
        confirm
      </button>
      <div style={styles.error}>{formError}</div>
    </div>
  );
};

const styles: Styles = {
  container: {
    padding: 40,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  error: {
    color: "red",
  },
};
