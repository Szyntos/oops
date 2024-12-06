import { StudentCardData } from "../../../hooks/StudentProfile/useStudentProfileData/useStudentData";
import { Avatar } from "../../images/Avatar";
import { Section } from "./Card/Section";
import { CardItem, CardItemProps } from "./Card/CardItem";
import { EMPTY_FIELD_STRING } from "../../../utils/constants";
import { Styles } from "../../../utils/Styles";

export function StudentCard({
  nick,
  displayName,
  index,
  group,
  avatarId,
  grade,
}: StudentCardData) {
  const profileItems: CardItemProps[] = [
    { icon: "name", title: displayName },
    { icon: "email", title: `${index}@student.agh.edu.pl` },
    { icon: "index", title: index },
  ];

  const performanceItems: CardItemProps[] = [
    { icon: "grade", title: grade },
    { icon: "score", title: 123 },
  ];

  const centerItems: CardItemProps[] = [
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
    <Section title={nick}>
      <div style={styles.avatarContainer}>
        <Avatar id={avatarId} size="l" />
        <div style={styles.itemsContainer}>
          {profileItems.map((item) => (
            <CardItem {...item} />
          ))}

          <div style={styles.performanceItemsContainer}>
            {performanceItems.map((item) => (
              <CardItem {...item} />
            ))}
          </div>
        </div>
      </div>

      <div style={styles.itemsContainer}>
        {centerItems.map((item) => (
          <CardItem {...item} />
        ))}
      </div>

      {/* TODO this progress bar probably should be in different card */}
      {/* <CourseProgressBar totalPoints={totalPoints} title="total progress bar" /> */}
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
    gap: 8,
  },
  performanceItemsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
