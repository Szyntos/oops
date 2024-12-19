import { AddedLevel, LevelRow } from "./LevelRow";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { CustomText } from "../../../../CustomText";
import { formStyles } from "../../../../../utils/utils";

type AddedLevelsProps = {
  levels: AddedLevel[];
  handleUp: (ordinal: number) => void;
  handleDown: (ordinal: number) => void;
  handleDelete: (ordinal: number) => void;
};

export const AddedLevels = ({
  levels,
  handleUp,
  handleDown,
  handleDelete,
}: AddedLevelsProps) => {
  return (
    <div>
      <CustomText style={formStyles.label}>Dodane poziomy</CustomText>
      <div style={formStyles.fieldsContainer}>
        {levels.length > 0 ? (
          levels.map((level, index) => (
            <LevelRow
              key={level.ordinal + level.name}
              level={level}
              handleDelete={() => handleDelete(level.ordinal)}
              handleUp={() => handleUp(level.ordinal)}
              handleDown={() => handleDown(level.ordinal)}
              blockDown={index === levels.length - 1}
              blockUp={index === 0}
            />
          ))
        ) : (
          <CustomText>{EMPTY_FIELD_STRING}</CustomText>
        )}
      </div>
    </div>
  );
};
