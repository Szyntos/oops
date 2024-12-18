import { CSSProperties } from "react";
import {
  AwardTypeType,
  UsersRolesType,
} from "../__generated__/schema.graphql.types";
import { Permissions } from "../components/Edition/Sections/SetupButtons";
import { Edition } from "../contexts/userContext";
import { tokens } from "../tokens";
import { Styles } from "./Styles";

export const EDITION_MARGIN_VERTICAL = 20;

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

type ChestEdition = {
  id: string;
  active: boolean;
};
export const isChestActive = (editions: ChestEdition[], edition: string) => {
  return Boolean(editions.find((e) => e.id === edition && e.active));
};

export const BACKGROUND_COLOR_ANIMATION = "background-color 0.3s ease";
export const COLOR_TRANSITION_ANIMATION = "color 0.3s ease";

export const getLinearGradient = (
  firstColor: string,
  secondColor: string,
): string => {
  return `linear-gradient(to right, ${firstColor}, ${secondColor})`;
};

export const getTimeWithoutSeconds = (time: string) => {
  return time.slice(0, -3);
};

export const getCardStyles = (isSelected: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 12,
  borderRadius: 12,
  backgroundColor: isSelected
    ? tokens.color.card.dark
    : tokens.color.card.light,
});

export const coordinatorStyles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    margin: EDITION_MARGIN_VERTICAL,
    marginLeft: 12,
    marginRight: 12,
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  avatarContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: tokens.font.title,
    color: tokens.color.text.primary,
    fontWeight: "bold",
    paddingBottom: 4,
  },
};

export const getGroupTimeString = (
  weekday: string,
  startTime: string,
  endTime: string,
) => {
  return `${weekday}, ${getTimeWithoutSeconds(startTime)}-${getTimeWithoutSeconds(endTime)}`;
};

export const ERROR_MESSAGE = "Wystąpił błąd...";

export const getAwardMaxUsageString = (maxUsage: number): string => {
  return `ograniczenie posiadanych sztuk: ${maxUsage === -1 ? "brak" : maxUsage}`;
};

export const getAwardValueString = (
  type: AwardTypeType,
  typeValue: number,
): string => {
  return type === AwardTypeType.Multiplicative
    ? `mnożnik: ${typeValue * 100}%`
    : `wartość: ${typeValue.toFixed(2)}pkt`;
};
