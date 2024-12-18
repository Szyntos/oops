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
      <Avatar size="m" id={level.imageId} />

      <TextField
        name="ordinal"
        label="Liczba porządkowa"
        variant="outlined"
        type="number"
        value={level.ordinal}
        style={styles.points}
        disabled={true}
      />

      <TextField
        name="min"
        label="Minimalna liczba punktów"
        variant="outlined"
        value={level.minPoints}
        style={styles.points}
        disabled={true}
      />

      <TextField
        name="maxPoints"
        label="Maksymalna liczba punktów"
        variant="outlined"
        value={level.maxPoints}
        style={styles.points}
        type="number"
        disabled
      />

      <TextField
        name="name"
        label="Nazwa"
        variant="outlined"
        value={level.name}
        style={styles.number}
        disabled
      />

      <FormControl fullWidth style={styles.number} disabled>
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

      <div>
        <button type="button" onClick={handleUp} disabled={blockUp}>
          Góra
        </button>
        <button type="button" onClick={handleDown} disabled={blockDown}>
          Dół
        </button>
        <button type="button" onClick={handleDelete}>
          -
        </button>
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
  title: {
    fontWeight: "bold",
  },
  error: {
    color: tokens.color.state.error,
  },
  number: {
    width: 120,
  },
};
