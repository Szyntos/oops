import { UsersRolesType } from "../__generated__/schema.graphql.types";
import { Edition } from "../hooks/common/useGroupsData";

type User = {
  role: string;
};

export type Category = {
  id: string;
  name: string;
  subcategories: Subcategory[];
};

export type Subcategory = {
  id: string;
  name: string;
  maxPoints: number;
};

export const hasRole = (user: User, allowedRoles: UsersRolesType[]) => {
  return allowedRoles.includes(user.role as UsersRolesType);
};

export const isEditionActive = (edition: Edition) => {
  const now = new Date();
  return new Date(edition.startDate) < now && now < new Date(edition.endDate);
};
