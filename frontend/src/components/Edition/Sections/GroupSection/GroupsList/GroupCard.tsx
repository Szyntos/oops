import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { Group } from "../../../../../hooks/Edition/useGroupsSection";
import {
  cardStyles,
  getCardStyles,
  getGroupTimeString,
} from "../../../../../utils/utils";
import { CustomText } from "../../../../CustomText";
import { SetupButtons } from "../../SetupButtons";

type GroupCardProps = {
  group: Group;
  editClick: () => void;
  deleteClick: () => void;
};

export const GroupCard = ({
  group,
  editClick,
  deleteClick,
}: GroupCardProps) => {
  const { openShowDialog } = useEditionSections();

  return (
    <div style={getCardStyles(false)}>
      <div style={{ ...cardStyles.textContainer, minWidth: 220 }}>
        <CustomText style={cardStyles.title}>
          {group.group.generatedName}
        </CustomText>

        <div style={cardStyles.CustomText}>
          <CustomText>
            {getGroupTimeString(
              group.group.weekday.weekdayName,
              group.group.startTime,
              group.group.endTime,
            )}
          </CustomText>
          <CustomText>
            {group.group.teacher.firstName} {group.group.teacher.secondName}
          </CustomText>
        </div>
      </div>

      <div style={{ ...cardStyles.textContainer, flex: 1 }}>
        {group.group.userGroups.map((student, index) => (
          <CustomText>
            {index + 1}. {student.user.firstName} {student.user.secondName}
          </CustomText>
        ))}
      </div>

      <SetupButtons
        permissions={group.permissions}
        handleEdit={editClick}
        handleDelete={deleteClick}
        handleShow={() => openShowDialog(group)}
      />
    </div>
  );
};
