import { Styles } from "../../../utils/Styles";
import { StudentCardData } from "../../../hooks/StudentProfile/useStudentProfileData/useStudentData";
import { Section } from "./Section/Section";
import { ItemWithIcon, ItemWithIconProps } from "./Section/ItemWithIcon";
import { EMPTY_FIELD_STRING } from "../../../utils/constants";
import { Styles } from "../../../utils/Styles";
import { CustomText } from "../../CustomText";
import { tokens } from "../../../tokens";
import { Avatar } from "../../avatars/Avatar";
import { getTimeWithoutSeconds } from "../../../utils/utils";

export function StudentCard({
  nick,
  displayName,
  index,
  group,
  avatarId,
  grade,
  totalPoints,
}: StudentCardData) {
  const profileItems: ItemWithIconProps[] = [
    { icon: "Imię", title: displayName },
    { icon: "Email", title: `${index}@student.agh.edu.pl` },
    { icon: "Indeks", title: index },
  ];

  const performanceItems: ItemWithIconProps[] = [
    { icon: "Ocena", title: grade },
    { icon: "Wynik", title: totalPoints },
  ];

  const centerItems: ItemWithIconProps[] = [
    {
      icon: "Grupa",
      title: group
        ? `${group.name}, ${group.weekday.name} ${getTimeWithoutSeconds(group.time.start)}-${getTimeWithoutSeconds(group.time.end)}`
        : EMPTY_FIELD_STRING,
    },
    {
      icon: "Nauczyciel",
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
