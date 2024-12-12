import { StudentCardData } from "../../../hooks/StudentProfile/useStudentProfileData/useStudentData";
import { Section } from "./Section/Section";
import { ItemWithIcon, ItemWithIconProps } from "./Section/ItemWithIcon";
import { EMPTY_FIELD_STRING } from "../../../utils/constants";
import { Styles } from "../../../utils/Styles";
import { CustomText } from "../../CustomText";
import { tokens } from "../../../tokens";
import { Avatar } from "../../avatars/Avatar";

export function StudentCard({
  nick,
  displayName,
  index,
  group,
  avatarId,
  grade,
}: StudentCardData) {
  const profileItems: ItemWithIconProps[] = [
    { icon: "name", title: displayName },
    { icon: "email", title: `${index}@student.agh.edu.pl` },
    { icon: "index", title: index },
  ];

  const performanceItems: ItemWithIconProps[] = [
    { icon: "grade", title: grade },
    { icon: "score", title: 123 },
  ];

  const centerItems: ItemWithIconProps[] = [
    {
      icon: "group",
      title: group
        ? `${group.name}, ${group.weekday.name} ${group.time.start}-${group.time.end}`
        : EMPTY_FIELD_STRING,
    },
    {
      icon: "instructor",
      title: group ? group.teacherDisplayName : EMPTY_FIELD_STRING,
    },
  ];

  return (
    <Section>
      <CustomText
        size={tokens.font.header}
        bold={true}
        color={tokens.color.accent.dark}
      >
        {nick}
      </CustomText>
      <div style={styles.avatarContainer}>
        <Avatar id={avatarId} size="l" />
        <div style={styles.itemsContainer}>
          {profileItems.map((item) => (
            <ItemWithIcon {...item} />
          ))}

          <div style={styles.performanceItemsContainer}>
            {performanceItems.map((item) => (
              <ItemWithIcon {...item} />
            ))}
          </div>
        </div>
      </div>

      <div style={styles.itemsContainer}>
        {centerItems.map((item) => (
          <ItemWithIcon {...item} />
        ))}
      </div>
    </Section>
  );
}

const styles: Styles = {
  avatarContainer: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  itemsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  performanceItemsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
