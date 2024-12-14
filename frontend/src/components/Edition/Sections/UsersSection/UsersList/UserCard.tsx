import { UsersRolesType } from "../../../../../__generated__/schema.graphql.types";
import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { User } from "../../../../../hooks/Edition/users/useUsersSection";
import { tokens } from "../../../../../tokens";
import { cardStyles, getCardStyles } from "../../../../../utils/utils";
import { CustomText } from "../../../../CustomText";
import { SetupButtons } from "../../SetupButtons";

type GroupCardProps = {
  user: User;
  handleEditClick: () => void;
  handleDeleteClick: () => void;
  handleStudentActiveness?: (user: User) => void;
};

export const UserCard = ({
  user,
  handleDeleteClick,
  handleEditClick,
  handleStudentActiveness,
}: GroupCardProps) => {
  const { openShowDialog } = useEditionSections();

  return (
    <div style={getCardStyles(false)}>
      <div style={cardStyles.textContainer}>
        <CustomText color={tokens.color.text.primary} bold={true}>
          {user.user.firstName} {user.user.secondName}
        </CustomText>
        {user.user.role === UsersRolesType.Student && (
          <CustomText>{user.user.nick}</CustomText>
        )}
      </div>

      {handleStudentActiveness ? (
        <SetupButtons
          permissions={user.permissions}
          handleDelete={handleDeleteClick}
          handleEdit={handleEditClick}
          isStudentActive={user.user.active}
          handleMarkChestActiveness={() => handleStudentActiveness(user)}
        />
      ) : (
        <SetupButtons
          permissions={user.permissions}
          handleDelete={handleDeleteClick}
          handleEdit={handleEditClick}
          handleShow={() => openShowDialog(user)}
        />
      )}
    </div>
  );
};
