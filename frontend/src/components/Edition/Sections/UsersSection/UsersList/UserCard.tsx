import { UsersRolesType } from "../../../../../__generated__/schema.graphql.types";
import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { User } from "../../../../../hooks/Edition/users/useUsersSection";
import { tokens } from "../../../../../tokens";
import { coordinatorStyles, getCardStyles } from "../../../../../utils/utils";
import { Avatar } from "../../../../avatars/Avatar";
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
    <div style={{ ...getCardStyles(false), minWidth: 260 }}>
      {user.user.role === UsersRolesType.Student ? (
        <div style={coordinatorStyles.avatarContainer}>
          <Avatar id={user.user.imageFile?.fileId} size={"s"} />
          <div style={coordinatorStyles.textContainer}>
            <CustomText style={coordinatorStyles.title}>
              {user.user.firstName} {user.user.secondName}
            </CustomText>
            <CustomText>{user.user.nick}</CustomText>
            <CustomText>{user.user.indexNumber}</CustomText>
          </div>
        </div>
      ) : (
        <div style={coordinatorStyles.textContainer}>
          <CustomText style={coordinatorStyles.title}>
            {user.user.firstName} {user.user.secondName}
          </CustomText>
          <CustomText color={tokens.color.text.secondary}>
            {user.user.email}
          </CustomText>
        </div>
      )}

      {user.user.role === UsersRolesType.Student && (
        <CustomText color={tokens.color.text.secondary}>
          {user.user.email}
        </CustomText>
      )}

      {handleStudentActiveness ? (
        <SetupButtons
          permissions={user.permissions}
          handleDelete={handleDeleteClick}
          handleEdit={handleEditClick}
          isStudentActive={user.user.active}
          handleMarkStudentActiveness={() => handleStudentActiveness(user)}
          handleShow={() => openShowDialog(user)}
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
