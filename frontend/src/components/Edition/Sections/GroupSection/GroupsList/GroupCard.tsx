import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { Group } from "../../../../../hooks/Edition/useGroupsSection";
import { tokens } from "../../../../../tokens";
import { cardStyles, getCardStyles } from "../../../../../utils/utils";
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
      <div style={{ ...cardStyles.textContainer, flex: 1 }}>
        <CustomText color={tokens.color.text.primary} bold={true}>
          {group.group.generatedName}
        </CustomText>
        <div>
          {group.group.userGroups.map((student, index) => (
            <CustomText>
              {index + 1}. {student.user.firstName} {student.user.secondName}
            </CustomText>
          ))}
        </div>
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
