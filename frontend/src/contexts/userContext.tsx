import {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { defaultUnauthenticatedUser } from "../utils/types";
import Cookies from "js-cookie";
import { UsersRolesType } from "../__generated__/schema.graphql.types";
import { cookiesStrings } from "../hooks/auth/useLogin";

export type User = {
  nick: string;
  role: UsersRolesType;
  userId: string;
  editions: Edition[];
  avatarSetByUser: boolean;
  nickSetByUser: boolean;
  selectedEdition: Edition | undefined;
};

export type Edition = {
  editionId: string;
  editionYear: number;
  label: string;
  name: string;
  startDate: string;
  endDate: string;
};

type UserContextType = {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  selectedEdition?: Edition;
  editions: Edition[];
  setEditions: Dispatch<SetStateAction<Edition[]>>;
  changeSelectedEdition: (edition: Edition | undefined) => void;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(() => {
    const userCookie = Cookies.get("user");
    return userCookie ? JSON.parse(userCookie) : defaultUnauthenticatedUser;
  });

  const [editions, setEditions] = useState<Edition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<Edition | undefined>(
    undefined,
  );

  useEffect(() => {
    if (user.role === UsersRolesType.UnauthenticatedUser) {
      setEditions([]);
      setSelectedEdition(undefined);
    } else {
      setEditions(user.editions);
      setSelectedEdition(user.selectedEdition);
    }
  }, [user]);

  const changeSelectedEdition = (edition: Edition | undefined) => {
    setSelectedEdition(edition);
    const updatedUser = { ...user, selectedEdition: edition };
    Cookies.set(cookiesStrings.user, JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        selectedEdition,
        editions,
        setEditions,
        changeSelectedEdition,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
