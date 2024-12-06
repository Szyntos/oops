import { StudentCardData } from "../../../hooks/StudentProfile/useStudentProfileData/useStudentData";
import { Avatar } from "../../images/Avatar";
import { CourseProgressBar } from "../../bars/CourseProgressBar";
import { Card } from "./Card/Card";
import { CardItem, CardItemProps } from "./Card/CardItem";
import { EMPTY_FIELD_STRING } from "../../../utils/constants";

export function StudentCard({
  displayName,
  index,
  group,
  totalPoints,
  avatarId,
  grade,
}: StudentCardData) {
  const items: CardItemProps[] = [
    { icon: "name", title: displayName },
    { icon: "index", title: index },
    {
      icon: "instructor",
      title: group ? group.teacherDisplayName : EMPTY_FIELD_STRING,
    },
    {
      icon: "group",
      title: group
        ? `${group.name}, ${group.weekday.name} ${group.time.start}-${group.time.end}`
        : EMPTY_FIELD_STRING,
    },
    { icon: "grade", title: grade },
  ];
  return (
    <Card>
      <Avatar id={avatarId} size="l" />
      <div>
        {items.map((item) => (
          <CardItem {...item} />
        ))}
      </div>
      {/* TODO this progress bar probably should be in different card */}
      <CourseProgressBar totalPoints={totalPoints} title="total progress bar" />
    </Card>
  );
}
