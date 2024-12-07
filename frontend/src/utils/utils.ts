import { UsersRolesType } from "../__generated__/schema.graphql.types";
import { Permissions } from "../components/Edition/Sections/SetupButtons";
import { Edition } from "../contexts/userContext";

type User = {
  role: string;
};

export type Category = {
  id: string;
  name: string;
  subcategories: Subcategory[];
  lightColor: string;
  darkColor: string;
};

export type Subcategory = {
  id: string;
  name: string;
  maxPoints: number;
  categoryId: number;
};

export const hasRole = (user: User, allowedRoles: UsersRolesType[]) => {
  return allowedRoles.includes(user.role as UsersRolesType);
};

export const isEditionActive = (edition: Edition) => {
  const now = new Date();
  return new Date(edition.startDate) < now && now < new Date(edition.endDate);
};

export const mockPermissions = {
  __typename: "ListPermissionsOutputType",
  canAdd: {
    allow: false,
  },
  canCopy: {
    allow: false,
  },
  canEdit: {
    allow: false,
  },
  canRemove: {
    allow: false,
  },
  canSelect: {
    allow: false,
  },
  canUnselect: {
    allow: false,
  },
} as Permissions;

export const GRADE_STRINGS = ["2.0", "3.0", "3.5", "4.0", "4.5", "5.0"];
