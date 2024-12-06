import React from "react";
import SettingsIconRounded from "@mui/icons-material/SettingsRounded";
import LogoutIconRounded from "@mui/icons-material/LogoutRounded";
import ModeEditRoundedIcon from "@mui/icons-material/ModeEditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import StarIcon from "@mui/icons-material/Star";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import BarChartIcon from "@mui/icons-material/BarChart";
import { Styles } from "../utils/Styles";
import { tokens } from "../tokens";

type IconMapperProps = {
  icon: Icon;
  onClick?: () => void;
  style?: React.CSSProperties;
  isDisabled?: boolean;
};

type ActionIcons = "settings" | "logout" | "edit" | "delete" | "add" | "chest";
type DisplayIcons =
  | "id"
  | "name"
  | "index"
  | "grade"
  | "group"
  | "instructor"
  | "progress";
export type Icon = ActionIcons | DisplayIcons;

const iconMap = {
  settings: SettingsIconRounded,
  logout: LogoutIconRounded,
  edit: ModeEditRoundedIcon,
  delete: DeleteRoundedIcon,
  add: AddRoundedIcon,
  chest: Inventory2OutlinedIcon,
  id: AccountCircleIcon,
  name: PersonIcon,
  index: FingerprintIcon,
  grade: StarIcon,
  group: GroupIcon,
  instructor: SchoolIcon,
  progress: BarChartIcon,
};

export const IconMapper = ({
  icon,
  onClick,
  isDisabled,
  style,
}: IconMapperProps) => {
  const IconComponent = iconMap[icon];

  return (
    <IconComponent
      onClick={onClick}
      style={{
        ...styles.icon,
        ...style,
        ...(onClick && styles.clickable),
        ...(isDisabled && styles.disabled),
      }}
    />
  );
};

const styles: Styles = {
  icon: {
    width: tokens.padding.m,
    height: tokens.padding.m,
    color: tokens.color.text.primary,
  },
  clickable: {
    cursor: "pointer",
  },
  disabled: {
    color: "grey", // TODO add token
  },
};
