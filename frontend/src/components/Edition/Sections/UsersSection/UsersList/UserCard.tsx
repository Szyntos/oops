import { User } from "../../../../../hooks/Edition/useUsersSection";
import { Styles } from "../../../../../utils/Styles";

type GroupCardProps = {
  user: User;
};

export const UserCard = ({ user }: GroupCardProps) => {
  return (
    <div style={styles.card}>
      <div>
        [{user.userId}] {user?.fullName}
      </div>
    </div>
  );
};

const styles: Styles = {
  card: {
    padding: 12,
    border: "1px solid black",
    width: 160,
  },
};
