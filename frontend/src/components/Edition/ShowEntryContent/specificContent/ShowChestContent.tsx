import { Chest } from "../../../../hooks/Edition/useChestsSection";

type ShowChestContentProps = {
  entry: Chest;
};
export const ShowChestContent = ({ entry }: ShowChestContentProps) => {
  return (
    <div>
      {entry.chest.chestType}
      <pre>{JSON.stringify(entry)}</pre>
    </div>
  );
};
