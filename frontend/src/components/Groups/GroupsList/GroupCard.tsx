import { useState } from "react";
import { Group } from "../../../hooks/common/useGroupsData";
import { tokens } from "../../../tokens";
import { FETCH_FILES_URL } from "../../../utils/constants";
import { Styles } from "../../../utils/Styles";
import { CustomText } from "../../CustomText";
import { EditableIndicator } from "../../EditableIndicator";

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
  const [isHoovered, setIsHoovered] = useState(false);

  return (
    <div
      style={{
        ...styles.container,
        ...(isHoovered ? { opacity: 0.9 } : undefined),
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHoovered(true)}
      onMouseLeave={() => setIsHoovered(false)}
    >
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
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: 240,
    height: 240,
    cursor: "pointer",
    padding: 12,
    paddingBottom: 4,
    position: "relative",
    backgroundColor: tokens.color.card.light,
    borderRadius: 12,
  },
  img: {
    width: "100%",
    height: 150,
    objectFit: "cover",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  detailsContainer: {
    paddingTop: 6,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  editableIndicatorWrapper: {
    top: 140,
    right: 32,
    position: "absolute",
  },
};
