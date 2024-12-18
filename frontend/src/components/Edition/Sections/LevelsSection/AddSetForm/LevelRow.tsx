import { Styles } from "../../../../../utils/Styles";
import {
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Avatar } from "../../../../avatars/Avatar";
import { GRADE_STRINGS } from "../../../../../utils/utils";
import { tokens } from "../../../../../tokens";
import { RowButton } from "../../CategoriesSection/AddCategoryForm/RowButton";

export type AddedLevel = {
  name: string;
  ordinal: number;
  minPoints: number;
  maxPoints: number;
  grade: string;
  imageId: string;
};

type LevelRowProps = {
  level: AddedLevel;
  blockUp?: boolean;
  blockDown?: boolean;
  handleDelete: () => void;
  handleUp: () => void;
  handleDown: () => void;
};

export const LevelRow = ({
  level,
  blockUp = false,
  blockDown = false,
  handleDelete,
  handleUp,
  handleDown,
}: LevelRowProps) => {
  return (
    <div style={styles.innerContainer}>
      <Avatar size="xs" id={level.imageId} />

      <TextField
        name="ordinal"
        label="Lp."
        variant="outlined"
        type="number"
        value={level.ordinal}
        style={styles.ordinal}
        disabled={true}
        size="small"
      />

      <TextField
        name="min"
        label="Min. punktów"
        variant="outlined"
        value={level.minPoints}
        style={styles.points}
        disabled={true}
        size="small"
      />

      <TextField
        name="maxPoints"
        label="Max. punktów"
        variant="outlined"
        value={level.maxPoints}
        style={styles.points}
        type="number"
        disabled
        size="small"
      />

      <TextField
        name="name"
        label="Nazwa"
        variant="outlined"
        value={level.name}
        style={styles.number}
        disabled
        size="small"
      />

      <FormControl fullWidth style={styles.grade} disabled size="small">
        {/* TODO */}
        <InputLabel error={undefined}>Ocena</InputLabel>
        <Select value={level.grade} label="Ocena">
          {GRADE_STRINGS.map((gradeOption) => (
            <MenuItem key={gradeOption} value={gradeOption}>
              {gradeOption}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <>
        <RowButton onClick={handleUp} isDisabled={blockUp} icon="up" />
        <RowButton
          color={tokens.color.state.error}
          onClick={handleDelete}
          isDisabled={false}
          icon="delete"
        />
        <RowButton onClick={handleDown} isDisabled={blockDown} icon="down" />
      </>
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
  points: {
    width: 110,
  },
  grade: {
    width: 110,
  },
  ordinal: {
    maxWidth: 52,
    minWidth: 52,
    width: 52,
  },
};
