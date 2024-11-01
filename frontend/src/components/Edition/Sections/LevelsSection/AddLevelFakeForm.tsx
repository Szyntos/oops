import { Styles } from "../../../../utils/Styles";
import { RowLevel } from "./LevelsRows/LevelRow";
import { LevelRows } from "./LevelsRows/LevelsRows";

export type AddLevelFakeFormProps = {
  initialLevelValues: RowLevel[];
  formError?: string;
  handleAdd: (levels: RowLevel[]) => void;
  imageIds: string[];
};

export const AddLevelFakeForm = ({
  initialLevelValues,
  formError,
  handleAdd,
  imageIds,
}: AddLevelFakeFormProps) => {
  return (
    <div style={styles.container}>
      <LevelRows
        initLevelValues={initialLevelValues}
        handleConfirm={handleAdd}
        imageIds={imageIds}
      />
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
