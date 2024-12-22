import { tokens } from "../../../../tokens";
import { NavbarItem } from "../../../layout/Navbar/NavarItem";
import {
  NAV_BAR_HEIGHT_WITH_BORDER,
  navbarStyles,
} from "../../../layout/Navbar/Navbar";
import { EDITION_NAVBAR_HEIGHT_WITH_BORDER } from "../../EditionScreenNavbar";

export type Folder = {
  title: string;
  pathPrefix: string;
};

const FILES_NAVBAR_HEIGHT = 30;
const NAVBAR_BORDER = 1;

type FilesNavarProps = {
  folders: Folder[];
  active: Folder;
  setActive: (section: Folder) => void;
};

export const FilesNavbar = ({
  folders,
  active,
  setActive,
}: FilesNavarProps) => {
  return (
    <div
      style={{
        ...navbarStyles.navbar,
        height: FILES_NAVBAR_HEIGHT,
        borderBottom: `${NAVBAR_BORDER}px solid ${tokens.color.text.secondary}`,
        top: NAV_BAR_HEIGHT_WITH_BORDER + EDITION_NAVBAR_HEIGHT_WITH_BORDER,
      }}
    >
      <div style={navbarStyles.itemsContainer}>
        <div style={navbarStyles.leftItemsContainer}>
          {folders.map((f) => (
            <NavbarItem
              onClick={() => setActive(f)}
              title={f.title}
              isActive={active === f}
              bold={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
