import PetsIcon from "@mui/icons-material/Pets";
import StarIcon from "@mui/icons-material/Star";
import SportsScoreIcon from "@mui/icons-material/SportsScore";
import SettingsIconRounded from "@mui/icons-material/SettingsRounded";
import LogoutIconRounded from "@mui/icons-material/LogoutRounded";
import ModeEditRoundedIcon from "@mui/icons-material/ModeEditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import GroupIcon from "@mui/icons-material/Group";
import SchoolIcon from "@mui/icons-material/School";
import BarChartIcon from "@mui/icons-material/BarChart";
import MailIcon from "@mui/icons-material/Mail";
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
  | "progress"
  | "score"
  | "email"
  | "monster" // Added monster icon
  | "level" // Added level icon
  | "minPoints" // Added min points icon
  | "maxPoints"; // Added max points icon

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
  score: SportsScoreIcon,
  email: MailIcon,
  monster: PetsIcon, // Icon for "wielka bestia"
  level: StarIcon, // Icon for "lvl. 6"
  minPoints: SportsScoreIcon, // Icon for "min points"
  maxPoints: SportsScoreIcon, // Icon for "max points"
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
    color: "grey",
  },
};
