import { LevelSet } from "../../../../hooks/Edition/useLevelSetsSection";

type ShowLevelSetContentProps = {
  entry: LevelSet;
};
export const ShowLevelSetContent = ({ entry }: ShowLevelSetContentProps) => {
  return (
    <div>
      {entry.levelSet.levelSetName}
      <pre>{JSON.stringify(entry, null, 2)}</pre>
    </div>
  );
};
