import { CSSProperties } from "react";
import {
  AwardTypeType,
  UsersRolesType,
} from "../__generated__/schema.graphql.types";
import { Permissions } from "../components/Edition/Sections/SetupButtons";
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

export const isEditionActive = (startDate: string, endDate: string) => {
  const now = new Date();
  return new Date(startDate) < now && now < new Date(endDate);
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
  thirdColor?: string,
): string => {
  return `linear-gradient(to right, ${firstColor}, ${secondColor}${thirdColor ? "," + thirdColor : ""})`;
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
  return `${weekday}, ${getTimestamp(startTime, endTime)}`;
};

export const getTimestamp = (startTime: string, endTime: string) => {
  return `${getTimeWithoutSeconds(startTime)}-${getTimeWithoutSeconds(endTime)}`;
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

export const MULTIPLICATIVE_TYPE_STRING = "MULTIPLICATIVE";

export const formStyles: Styles = {
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  fieldsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  label: {
    color: tokens.color.text.mui,
    paddingLeft: 12,
    fontSize: 13,
    paddingBottom: 12,
  },
};

export const DATE_YYYY_MM_DD_REGEXP = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_HH_MM_REGEXP = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

export const mapAwardTypeToPolish = (type: AwardTypeType) => {
  let text = "";
  switch (type) {
    case AwardTypeType.Additive:
      text = "Addytywna".toLocaleUpperCase();
      break;
    case AwardTypeType.AdditiveNext:
      text = "Przyszła addytywna";
      break;
    case AwardTypeType.AdditivePrev:
      text = "Przeszła addytywna";
      break;
    case AwardTypeType.Multiplicative:
      text = "Multiplikatywna";
      break;
  }
  return text.toUpperCase();
};

export const formErrors = {
  required: "wymagane",
  minNumber: (x: number) => `>${x}`,
  maxNumber: (x: number) => `<${x}`,
  regexp: (r: string) => `oczekiwany format ${r}`,
  email: "błędny format",
};
