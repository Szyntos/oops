import { Styles } from "../../utils/Styles";
import { EditableIndicator } from "../EditableIndicator";
import { StudentFromList } from "./StudentsList";
import { tokens } from "../../tokens";
import { CustomText } from "../CustomText";
import { HooverWrapper } from "../HooverWrapper";
import { Avatar } from "../avatars/Avatar";

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
  return (
    <HooverWrapper>
      <div style={styles.container} onClick={onClick}>
        <div style={styles.topContainer}>
          <Avatar id={student.avatarId} size={"m"} />
          <div style={styles.textContainer}>
            <CustomText size={tokens.font.title} bold={true}>
              {student.nick}
            </CustomText>
            <div style={styles.secondaryTextContainer}>
              <CustomText color={tokens.color.text.secondary}>
                {student.firstName} {student.secondName}
              </CustomText>
              <CustomText color={tokens.color.text.secondary}>
                {student.index}
              </CustomText>
            </div>
          </div>
        </div>

        <CustomText color={tokens.color.text.secondary}>
          {student.group.name}
        </CustomText>
        {withEditableRights && (
          <div style={styles.rightBottomCorner}>
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
    padding: CARD_PADDING,
    gap: 12,
    backgroundColor: tokens.color.card.dark,
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
    gap: 6,
  },
  secondaryTextContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  rightBottomCorner: {
    position: "absolute",
    bottom: CARD_PADDING,
    right: CARD_PADDING,
  },
};
