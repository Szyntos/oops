import { User } from "../contexts/userContext";
import { UsersRolesType } from "../__generated__/schema.graphql.types";

export const defaultUnauthenticatedUser: User = {
  nick: "Guest",
  role: UsersRolesType.UnauthenticatedUser,
  userId: "unauthenticated",
  editions: [],
  avatarSetByUser: false,
  nickSetByUser: false,
  selectedEdition: undefined,
};
