import { Points } from "../../../../hooks/StudentProfile";
import { dateOptions } from "../../../../utils/constants";

type DateCellContentProps = {
  points: Points;
};

export const DateCellContent = ({ points }: DateCellContentProps) => {
  const date = new Date(points.updatedAt ?? points.createdAt);

  return <div>{date.toLocaleDateString("pl-PL", dateOptions)}</div>;
};
