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
import { isEditionActive } from "../utils/utils";

export type User = {
  nick: string;
  role: UsersRolesType;
  userId: string;
  editions: Edition[];
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
  setSelectedEdition: Dispatch<SetStateAction<Edition | undefined>>;
  editions: Edition[];
  setEditions: Dispatch<SetStateAction<Edition[]>>;
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
      if (user.editions.length > 0) {
        const activeEdition = user.editions.filter((e) =>
          isEditionActive(e),
        )[0];
        setSelectedEdition(activeEdition ? activeEdition : user.editions[0]);
      } else {
        setSelectedEdition(undefined);
      }
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        selectedEdition,
        setSelectedEdition,
        editions,
        setEditions,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
