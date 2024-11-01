import { useState } from "react";
import { LevelRow, RowLevel } from "./LevelRow";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { SelectImage } from "../../../../inputs/SelectImage";

type LevelRowProps = {
  initLevelValues: RowLevel[];
  handleConfirm: (levels: RowLevel[]) => void;
  imageIds: string[];
};

export const LevelRows = ({
  initLevelValues,
  handleConfirm,
  imageIds,
}: LevelRowProps) => {
  const [levels, setLevels] = useState<RowLevel[]>(initLevelValues);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const handleAdd = (level: RowLevel) => {
    // TODO check if not duplicates
    const updatedRows = [
      ...levels,
      {
        name: level.name,
        maxPoints: level.maxPoints,
        grade: level.grade,
        imageId: selectedId,
      },
    ].sort((a, b) => a.maxPoints - b.maxPoints);
    setLevels(updatedRows);
  };

  const handleDelete = (ordinal: number) => {
    const updatedRows = levels
      .filter((_, index) => index + 1 !== ordinal)
      .map((row, index) => {
        return { ...row, ordinal: index + 1 };
      });
    setLevels(updatedRows);
  };

  const handleUp = (ordinal: number) => {
    const index = ordinal - 1;
    const updated = levels.map((row, i) => {
      if (i === index - 1)
        return {
          ...levels[index - 1],
          name: levels[index].name,
          imageId: levels[index].imageId,
        };
      if (i === index)
        return {
          ...levels[index],
          name: levels[index - 1].name,
          imageId: levels[index - 1].imageId,
        };
      return row;
    });
    setLevels(updated);
  };

  const handleDown = (ordinal: number) => {
    const index = ordinal - 1;
    const updated = levels.map((row, i) => {
      if (i === index)
        return {
          ...levels[index],
          name: levels[index + 1].name,
          imageId: levels[index + 1].imageId,
        };
      if (i === index + 1)
        return {
          ...levels[index + 1],
          name: levels[index].name,
          imageId: levels[index].imageId,
        };
      return row;
    });
    setLevels(updated);
  };

  return (
    <div>
      <div>Added levels: </div>
      {levels.length > 0
        ? levels.map((row, index) => (
            <LevelRow
              key={index + row.name}
              initialValues={row}
              minPoints={index === 0 ? 0 : levels[index - 1].maxPoints}
              ordinal={index + 1}
              handleAdd={handleAdd}
              handleDelete={handleDelete}
              handleUp={handleUp}
              handleDown={handleDown}
              blockDown={index === levels.length - 1}
              blockUp={index === 0}
              varinat="display"
            />
          ))
        : EMPTY_FIELD_STRING}

      <div>
        <div>Add level:</div>
        <LevelRow
          initialValues={{
            name: "",
            maxPoints: 0,
            grade: "",
          }}
          handleAdd={handleAdd}
          handleDelete={handleDelete}
          handleUp={handleUp}
          handleDown={handleDown}
          varinat="add"
        />
        <SelectImage
          ids={imageIds}
          selectedId={selectedId}
          onSelectClick={(id: string) => setSelectedId(id)}
          // TODO
          error={undefined}
        />
      </div>

      <button onClick={() => handleConfirm(levels)}>confirm</button>
    </div>
  );
};
