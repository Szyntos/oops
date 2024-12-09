import { Styles } from "../../utils/Styles";
import { Avatar } from "../images/Avatar";
import { EditableIndicator } from "../EditableIndicator";
import { StudentFromList } from "./StudentsList";
import { tokens } from "../../tokens";
import { CustomText } from "../CustomText";
import { useState } from "react";

export const CARD_PADDING = 12;
export const CARD_BORDER = 8;

type StudentsListCardProps = {
  student: StudentFromList;
  onClick: () => void;
  withEditableRights: boolean;
};

export const StudentsListCard = ({
  student,
  onClick,
  withEditableRights,
}: StudentsListCardProps) => {
  const [isHoovered, setIsHoovered] = useState(false);
  return (
    <div
      style={{ ...styles.container, opacity: isHoovered ? 0.95 : 1 }}
      onClick={onClick}
      onMouseLeave={() => setIsHoovered(false)}
      onMouseEnter={() => setIsHoovered(true)}
    >
      <div style={styles.topContainer}>
        <Avatar id={student.avatarId} size={"m"} />
        <div style={styles.textContainer}>
          <CustomText size={tokens.font.title} bold={true}>
            {student.nick}
          </CustomText>
          <div style={styles.secondaryTextContainer}>
            <CustomText>
              {student.firstName} {student.secondName}
            </CustomText>
            <CustomText>{student.index}</CustomText>
          </div>
        </div>
      </div>

      <CustomText>{student.group.name}</CustomText>
      {withEditableRights && (
        <div style={styles.rightBottomCorner}>
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
    padding: CARD_PADDING,
    gap: 6,
    backgroundColor: tokens.color.card.light,
    borderRadius: CARD_BORDER,
    cursor: "pointer",
    position: "relative",
  },
  topContainer: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  secondaryTextContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  rightBottomCorner: {
    position: "absolute",
    bottom: CARD_PADDING,
    right: CARD_PADDING,
  },
};
