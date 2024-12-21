import { Award } from "../../../../hooks/Edition/useAwardsSection";

type ShowAwardContentProps = {
  entry: Award;
};
export const ShowAwardContent = ({ entry }: ShowAwardContentProps) => {
  console.log("HERE");
  console.log(entry);
  return (
    <div>
      {entry.award.awardName}
      <pre>{JSON.stringify(entry, null, 2)}</pre>
    </div>
  );
};
