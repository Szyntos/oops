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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import FunctionsIcon from "@mui/icons-material/Functions";
import CloseIcon from "@mui/icons-material/Close";
import { MdAutoGraph } from "react-icons/md";
import { PiTreasureChestLight } from "react-icons/pi";
import { GiBackForth } from "react-icons/gi";
import { Styles } from "../utils/Styles";
import { tokens } from "../tokens";
import { BiSolidMedal } from "react-icons/bi";

type IconMapperProps = {
  icon: Icon;
  onClick?: () => void;
  style?: React.CSSProperties;
  isDisabled?: boolean;
  size?: number;
  color?: string;
};

type MUIIcons =
  | "settings"
  | "logout"
  | "edit"
  | "delete"
  | "add"
  | "chest"
  | "id"
  | "name"
  | "index"
  | "star"
  | "group"
  | "instructor"
  | "progress"
  | "score"
  | "email"
  | "monster"
  | "level"
  | "points"
  | "yes"
  | "no"
  | "sum"
  | "close";

type ReactIcons = "grade" | "level2" | "chest2" | "startEnd";

export type Icon = MUIIcons | ReactIcons;

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
  star: StarIcon,
  group: GroupIcon,
  instructor: SchoolIcon,
  progress: BarChartIcon,
  score: SportsScoreIcon,
  email: MailIcon,
  monster: PetsIcon,
  level: StarIcon,
  points: SportsScoreIcon,
  yes: CheckCircleIcon,
  no: CancelIcon,
  sum: FunctionsIcon,
  grade: BiSolidMedal,
  level2: MdAutoGraph,
  chest2: PiTreasureChestLight,
  startEnd: GiBackForth,
  close: CloseIcon,
};

export const IconMapper = ({
  icon,
  onClick,
  isDisabled,
  style,
  size = 22,
  color,
}: IconMapperProps) => {
  const IconComponent = iconMap[icon];

  if (!IconComponent) {
    console.error(`Icon "${icon}" not found in iconMap`);
    return null;
  }

  return (
    <IconComponent
      onClick={onClick}
      style={{
        ...styles.icon,
        ...style,
        ...(onClick && styles.clickable),
        ...(isDisabled && styles.disabled),
        width: size,
        height: size,
        color: color ?? tokens.color.text.secondary,
      }}
    />
  );
};

const styles: Styles = {
  icon: {
    width: tokens.padding.m,
    height: tokens.padding.m,
  },
  clickable: {
    cursor: "pointer",
  },
  disabled: {
    color: tokens.color.state.disabled,
  },
};
