import { Group } from "../../../hooks/common/useGroupsData";
import { tokens } from "../../../tokens";
import { FETCH_FILES_URL } from "../../../utils/constants";
import { Styles } from "../../../utils/Styles";
import { CustomText } from "../../CustomText";
import { EditableIndicator } from "../../EditableIndicator";
import { CARD_BORDER, CARD_PADDING } from "../../Students/StudentsListCard";
import { HooverWrapper } from "../../HooverWrapper";

type GroupCardProps = {
  group: Group;
  onClick: () => void;
  withEditableRights: boolean;
};

export const GroupCard = ({
  group,
  onClick,
  withEditableRights,
}: GroupCardProps) => {
  return (
    <HooverWrapper>
      <div style={styles.container} onClick={onClick}>
        <img
          src={`${FETCH_FILES_URL}${group.imageId}`}
          alt={`img id ${group.imageId}`}
          style={styles.img}
        />
        <CustomText bold={true} size={tokens.font.title}>
          {group.name}
        </CustomText>

        <div style={styles.detailsContainer}>
          <CustomText>
            {group.weekday.name} {group.time.start}-{group.time.end}
          </CustomText>
          <CustomText>{group.teacher.fullName}</CustomText>
        </div>

        {withEditableRights && (
          <div style={styles.editableIndicatorWrapper}>
            <EditableIndicator />
          </div>
        )}
      </div>
    </HooverWrapper>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: 240,
    height: 240,
    cursor: "pointer",
    padding: CARD_PADDING,
    paddingBottom: 4,
    position: "relative",
    backgroundColor: tokens.color.card.light,
    borderRadius: CARD_BORDER,
  },
  img: {
    width: "100%",
    height: 150,
    objectFit: "cover",
    borderRadius: CARD_BORDER,
    overflow: "hidden",
    marginBottom: 12,
  },
  detailsContainer: {
    paddingTop: 8,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  editableIndicatorWrapper: {
    top: 140,
    right: 24,
    position: "absolute",
  },
};
