import { ReactElement } from "react";
import { hasRole } from "../utils/utils";
import { Forbidden } from "../screens/Forbidden/Forbidden";
import { useUser } from "../hooks/common/useUser";
import { UsersRolesType } from "../__generated__/schema.graphql.types";

type ProtectedRouteProps = {
  element: ReactElement;
  allowedRoles: UsersRolesType[];
};

export const ProtectedRoute = ({
  element,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { user } = useUser();
  return hasRole(user, allowedRoles) ? element : <Forbidden />;
};
