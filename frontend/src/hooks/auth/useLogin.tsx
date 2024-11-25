import { useNavigate } from "react-router-dom";
import { Edition, User } from "../../contexts/userContext";
import { useCurrentUserLazyQuery } from "../../graphql/currentUser.graphql.types";
import { pathsGenerator } from "../../router/paths";
import { defaultUnauthenticatedUser } from "../../utils/types";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import Cookies from "js-cookie";
import { useUser } from "../common/useUser";
import { useApolloClient } from "@apollo/client";
import { UserFromList } from "../../components/Welcome/UsersListWithFilter/UsersListWithFilter";
import { UsersRolesType } from "../../__generated__/schema.graphql.types";
import { isEditionActive } from "../../utils/utils";

export const cookiesStrings = {
  token: "token",
  user: "user",
};

type LoginCredentials = {
  email: string;
  password: string;
};

export const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const apolloClient = useApolloClient();

  const [fetchCurrentUser] = useCurrentUserLazyQuery();

  const loginWithUserSelect = async (userFromList: UserFromList) => {
    const token = getBypassToken(userFromList.userId);
    Cookies.set(cookiesStrings.token, token);

    const { data, error } = await fetchCurrentUser();

    const editions: Edition[] =
      data?.getCurrentUser.editions.map((edition) => {
        return {
          name: edition?.editionName as string,
          editionId: edition?.editionId as string,
          editionYear: edition?.editionYear as number,
          endDate: edition?.endDate as string,
          label: edition?.label as string,
          startDate: edition?.startDate as string,
        };
      }) ?? [];

    const user: User | undefined = data?.getCurrentUser
      ? {
          nick: data?.getCurrentUser.user.nick,
          role: data?.getCurrentUser.user.role.toUpperCase() as UsersRolesType,
          userId: data?.getCurrentUser.user.userId,
          selectedEdition: getInitSelectedEdition(editions),
          editions,
        }
      : undefined;

    if (error || !user) {
      await logout();
      throw new Error(error?.message ?? "Fetched current user is undefined");
    }

    Cookies.set(cookiesStrings.user, JSON.stringify(user));

    setUser(user);
    navigateToStartScreen(user);
  };

  const getBypassToken = (userId: string) => {
    return `Bypass${userId}`;
  };

  const loginWithCredentials = async (credentials: LoginCredentials) => {
    const loginWithBypass = credentials.password.length < 4;

    // set cookie token
    // login with bypass - assumption that password is correct userId
    const token = loginWithBypass
      ? getBypassToken(credentials.password)
      : await getFirebaseToken(credentials);

    Cookies.set(cookiesStrings.token, token);

    // fetch currently logged in user data
    const { data, error } = await fetchCurrentUser();

    const editions: Edition[] =
      data?.getCurrentUser.editions.map((edition) => {
        return {
          name: edition?.editionName as string,
          editionId: edition?.editionId as string,
          editionYear: edition?.editionYear as number,
          endDate: edition?.endDate as string,
          label: edition?.label as string,
          startDate: edition?.startDate as string,
        };
      }) ?? [];
    const user: User | undefined = data?.getCurrentUser
      ? {
          nick: data?.getCurrentUser.user.nick,
          role: data?.getCurrentUser.user.role.toUpperCase() as UsersRolesType,
          userId: data?.getCurrentUser.user.userId,
          selectedEdition: getInitSelectedEdition(editions),
          editions,
        }
      : undefined;

    if (error || !user) {
      await logout();
      throw new Error(error?.message ?? "Fetched current user is undefined");
    }
    // set cookie user
    Cookies.set(cookiesStrings.user, JSON.stringify(user));
    setUser(user);
    navigateToStartScreen(user);
  };

  const getFirebaseToken = async (credentials: LoginCredentials) => {
    await signInWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password,
    );
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error("Token is null - sign in failed.");
    }
    return token;
  };

  const navigateToStartScreen = (user: User) => {
    // TODO frontend and backend enums do not match
    switch (user.role) {
      case UsersRolesType.Coordinator:
      case UsersRolesType.Teacher:
        navigate(pathsGenerator.teacher.Groups);
        break;
      case UsersRolesType.Student:
        navigate(pathsGenerator.student.StudentProfile);
        break;
      default:
        throw new Error("should never happen.");
    }
  };

  const logout = async () => {
    Cookies.remove(cookiesStrings.token);
    Cookies.remove(cookiesStrings.user);

    await apolloClient.clearStore();

    setUser(defaultUnauthenticatedUser);
    navigate(pathsGenerator.common.Default);
  };

  return {
    loginWithUserSelect,
    loginWithCredentials,
    logout,
  };
};

const getInitSelectedEdition = (editions: Edition[]) => {
  const selectedEdition =
    editions.length > 0
      ? editions.filter((e) => isEditionActive(e))[0]
      : undefined;
  return selectedEdition;
};
