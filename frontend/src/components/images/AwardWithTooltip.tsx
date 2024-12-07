import { AwardImage } from "./AwardImage";
import { Bonus } from "../../hooks/StudentProfile";
import { TooltipWrapper } from "../TooltipWrapper";
import { dateOptions } from "../../utils/constants";
import { Styles } from "../../utils/Styles";
import { ImageSize } from "./Image";

type AwardWithTooltipProps = {
  bonus: Bonus;
  size: ImageSize;
};

export const AwardWithTooltip = ({ bonus, size }: AwardWithTooltipProps) => {
  const displayDate = new Date(bonus.updatedAt ?? bonus.createdAt);

  return (
    <TooltipWrapper
      tooltipContent={
        <div style={styles.container}>
          <div style={styles.title}>{bonus.award.name}</div>
          <div>{bonus.award.description}</div>
          <div>points: {bonus.award.value.toFixed(2)}</div>
          <div>{displayDate.toLocaleDateString("pl-PL", dateOptions)}</div>
        </div>
      }
    >
      <AwardImage id={bonus.award.imgId} size={size} />
    </TooltipWrapper>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    fontWeight: "bold",
  },
};
