import { User } from "../../../../../hooks/Edition/users/useUsersSection";
import { CardsSection } from "../../../CardsSection";
import { UserCard } from "./UserCard";

type UsersListProps = {
  users: User[];
  title: string;
  handleDeleteClick: (user: User) => void;
  handleEditClick: (user: User) => void;
  handleStudentActiveness?: (user: User) => void;
};

export const UsersList = ({
  users,
  title,
  handleDeleteClick,
  handleEditClick,
  handleStudentActiveness,
}: UsersListProps) => {
  return (
    <CardsSection
      title={title}
      cards={users.map((user) => (
        <UserCard
          user={user}
          handleDeleteClick={() => handleDeleteClick(user)}
          handleEditClick={() => handleEditClick(user)}
          handleStudentActiveness={handleStudentActiveness}
        />
      ))}
    />
  );
};
