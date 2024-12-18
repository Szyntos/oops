import { Group } from "../../../../hooks/Edition/useGroupsSection";

type ShowGroupContentProps = {
  entry: Group;
};
export const ShowGroupContent = ({ entry }: ShowGroupContentProps) => {
  return (
    <div>
      {entry.group.generatedName}
      <pre>{JSON.stringify(entry, null, 2)}</pre>
    </div>
  );
};
