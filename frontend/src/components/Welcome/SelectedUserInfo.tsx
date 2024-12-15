import { User } from "../../contexts/userContext";

type SelectedUserInfoProps = {
  user: User | undefined;
};

export const SelectedUserInfo = ({ user }: SelectedUserInfoProps) => {
  return (
    <div>
      <h2>Zalogowany użytkownik:</h2>
      {user ? (
        <>
          <p>Nick: {user.nick}</p>
          <p>Rola: {user.role}</p>
          <p>ID: {user.userId}</p>
        </>
      ) : (
        <p>---</p>
      )}
    </div>
  );
};
