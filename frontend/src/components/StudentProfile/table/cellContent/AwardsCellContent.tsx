import { Points } from "../../../../hooks/StudentProfile";
import { EMPTY_FIELD_STRING } from "../../../../utils/constants";
import { Styles } from "../../../../utils/Styles";
import { AwardWithTooltip } from "../../../avatars/AwardWithTooltip";
import { CustomText } from "../../../CustomText";

type AwardsCellContentProps = {
  points: Points;
};

export const AwardsCellContent = ({ points }: AwardsCellContentProps) => {
  const bonuses = points.points.partialBonusType;

  if (bonuses.length === 0) {
    return <CustomText>{EMPTY_FIELD_STRING}</CustomText>;
  }

  // TODO better map
  return (
    <div style={styles.awardsContainer}>
      {bonuses.map((bonus) => {
        return (
          <AwardWithTooltip
            props={{
              id: bonus?.bonuses.award.awardId ?? "",
              name: bonus?.bonuses.award.awardName ?? "",
              description: bonus?.bonuses.award.description ?? "",
              value: bonus?.partialValue ?? -1,
              imageId: bonus?.bonuses.award.imageFile?.fileId ?? "",
              updatedAt: bonus?.bonuses.updatedAt ?? "",
              createdAt: bonus?.bonuses.createdAt ?? "",
            }}
            size={"xs"}
          />
        );
      })}
    </div>
  );
};

const styles: Styles = {
  awardsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    maxWidth: 240,
    flexWrap: "wrap",
  },
};
