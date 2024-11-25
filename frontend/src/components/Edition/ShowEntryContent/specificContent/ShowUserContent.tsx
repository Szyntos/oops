import { User } from "../../../../hooks/Edition/users/useUsersSection";

type ShowUserContentProps = {
  entry: User;
};
export const ShowUserContent = ({ entry }: ShowUserContentProps) => {
  return (
    <div>
      {entry.user.firstName} {entry.user.secondName}
      <pre>{JSON.stringify(entry)}</pre>
    </div>
  );
};
