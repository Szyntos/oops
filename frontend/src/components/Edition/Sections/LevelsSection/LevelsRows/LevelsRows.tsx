import { useState } from "react";
import { LevelRow, RowLevel } from "./LevelRow";

type LevelRowProps = {
  initLevelValues: RowLevel[];
  handleConfirm: (levels: RowLevel[]) => void;
};

export const LevelRows = ({
  initLevelValues,
  handleConfirm,
}: LevelRowProps) => {
  const [levels, setLevels] = useState<RowLevel[]>(initLevelValues);

  const handleAdd = (level: RowLevel) => {
    setLevels((prev) => [
      ...prev,
      {
        name: level.name,
        maxPoints: level.maxPoints,
        grade: level.grade,
      },
    ]);
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
      if (i === index - 1) return levels[index];
      if (i === index) return levels[index - 1];
      return row;
    });
    setLevels(updated);
  };

  const handleDown = (ordinal: number) => {
    const index = ordinal - 1;
    const updated = levels.map((row, i) => {
      if (i === index) return levels[index + 1];
      if (i === index + 1) return levels[index];
      return row;
    });
    setLevels(updated);
  };

  return (
    <div>
      {levels.map((row, index) => (
        <LevelRow
          key={index + row.name}
          initialValues={row}
          ordinal={index + 1}
          handleAdd={handleAdd}
          handleDelete={handleDelete}
          handleUp={handleUp}
          handleDown={handleDown}
          blockDown={index === levels.length - 1}
          blockUp={index === 0}
          display={{ direction: true, add: false, delete: true }}
          disabled={true}
        />
      ))}
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
        display={{ direction: false, add: true, delete: false }}
      />
      <button onClick={() => handleConfirm(levels)}>confirm</button>
    </div>
  );
};
