import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { Group } from "../../../../../hooks/Edition/useGroupsSection";
import { tokens } from "../../../../../tokens";
import {
  coordinatorStyles,
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
    <div style={getCardStyles(true)}>
      <div style={{ ...coordinatorStyles.textContainer, minWidth: 220 }}>
        <CustomText style={coordinatorStyles.title}>
          {group.group.generatedName}
        </CustomText>

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

      <div style={{ ...coordinatorStyles.textContainer, flex: 1 }}>
        {group.group.userGroups.map((student, index) => (
          <CustomText color={tokens.color.text.secondary}>
            {index + 1}. {student.user.firstName} {student.user.secondName}
          </CustomText>
        ))}
      </div>

      <SetupButtons
        permissions={group.permissions}
        handleEdit={editClick}
        handleDelete={deleteClick}
        handleShow={() => openShowDialog(group, "group")}
      />
    </div>
  );
};
