import { Styles } from "../../../../../utils/Styles";
import {
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Image } from "../../../../images/Image";
import { grades } from "./AddLevelForm";

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
      <Image size={64} disabled={false} id={level.imageId} />

      <TextField
        name="ordinal"
        label="ordinal"
        variant="outlined"
        type="number"
        value={level.ordinal}
        style={styles.points}
        disabled={true}
      />

      <TextField
        name="min"
        label="min"
        variant="outlined"
        value={level.minPoints}
        style={styles.points}
        disabled={true}
      />

      <TextField
        name="maxPoints"
        label="max"
        variant="outlined"
        value={level.maxPoints}
        style={styles.points}
        type="number"
        disabled
      />

      <TextField
        name="name"
        label="name"
        variant="outlined"
        value={level.name}
        style={styles.number}
        disabled
      />

      <FormControl fullWidth style={styles.number} disabled>
        <InputLabel>Grade</InputLabel>
        <Select value={level.grade} label="Grade">
          {grades.map((gradeOption) => (
            <MenuItem key={gradeOption} value={gradeOption}>
              {gradeOption}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div>
        <button type="button" onClick={handleUp} disabled={blockUp}>
          up
        </button>
        <button type="button" onClick={handleDown} disabled={blockDown}>
          down
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
  title: { fontWeight: "bold" },
  error: { color: "red" },
  number: {
    width: 120,
  },
};
