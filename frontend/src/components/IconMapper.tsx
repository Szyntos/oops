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
import SportsScoreIcon from "@mui/icons-material/SportsScore"; // Icon for score
import MailIcon from "@mui/icons-material/Mail"; // Icon for email
import { Styles } from "../utils/Styles";
import { tokens } from "../tokens";

// Defining the types for the props and icon keys
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
  | "progress"
  | "score"
  | "email"; // Adding email icon to the list of display icons

export type Icon = ActionIcons | DisplayIcons;

// Mapping the icon keys to actual Material UI icons
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
  score: SportsScoreIcon, // Added for points
  email: MailIcon, // Added for email
};

// IconMapper Component
export const IconMapper = ({
  icon,
  onClick,
  isDisabled,
  style,
}: IconMapperProps) => {
  const IconComponent = iconMap[icon]; // Get the corresponding icon component

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

// Default styles for icons
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
    color: "grey", // You can adjust this with your design tokens
  },
};
