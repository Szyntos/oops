import { Award } from "../../../../hooks/Edition/useAwardsSection";

type ShowAwardContentProps = {
  entry: Award;
};
export const ShowAwardContent = ({ entry }: ShowAwardContentProps) => {
  return (
    <div>
      {entry.award.awardName}
      <pre>{JSON.stringify(entry)}</pre>
    </div>
  );
};
