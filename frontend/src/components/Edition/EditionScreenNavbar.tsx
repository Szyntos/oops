import { pathsGenerator } from "../../router/paths";
import { useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../tokens";
import { NavbarItem } from "../layout/Navbar/NavarItem";
import {
  NAV_BAR_HEIGHT_WITH_BORDER,
  navbarStyles,
} from "../layout/Navbar/Navbar";

const EDITION_NAVBAR_HEIGHT = 40;
const NAVBAR_BORDER = 1;
export const EDITION_NAVBAR_HEIGHT_WITH_BORDER =
  EDITION_NAVBAR_HEIGHT + NAVBAR_BORDER;

type EditionScreenNavbarProps = {
  editionId: number;
};

export type Section = {
  title:
    | "Nagrody"
    | "Kategorie"
    | "Skrzynki"
    | "Grupy"
    | "Poziomy"
    | "Pliki"
    | "Użytkownicy"
    | "Warunki zaliczenia";

  path: (editionId: string) => string;
};

const sections: Section[] = [
  {
    title: "Kategorie",
    path: pathsGenerator.coordinator.EditionChildren.Categories,
  },
  {
    title: "Poziomy",
    path: pathsGenerator.coordinator.EditionChildren.Levels,
  },
  {
    title: "Warunki zaliczenia",
    path: pathsGenerator.coordinator.EditionChildren.GradingChecks,
  },
  {
    title: "Nagrody",
    path: pathsGenerator.coordinator.EditionChildren.Awards,
  },
  {
    title: "Skrzynki",
    path: pathsGenerator.coordinator.EditionChildren.Chests,
  },
  {
    title: "Użytkownicy",
    path: pathsGenerator.coordinator.EditionChildren.Users,
  },
  {
    title: "Grupy",
    path: pathsGenerator.coordinator.EditionChildren.Groups,
  },
  {
    title: "Pliki",
    path: pathsGenerator.coordinator.EditionChildren.Files,
  },
];

export const EditionScreenNavbar = ({
  editionId,
}: EditionScreenNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSectionActive = (section: Section) => {
    const activeSection = sections.find(
      (s) => location.pathname === s.path(editionId.toString()),
    );
    if (section.title !== "Kategorie") {
      return activeSection?.title === section.title;
    }
    return !activeSection || activeSection.title === section.title;
  };

  const handleSectionChange = (section: Section) => {
    navigate(section.path(editionId.toString()));
  };

  return (
    <div
      style={{
        ...navbarStyles.navbar,
        height: EDITION_NAVBAR_HEIGHT,
        borderBottom: `${NAVBAR_BORDER}px solid ${tokens.color.text.secondary}`,
        top: NAV_BAR_HEIGHT_WITH_BORDER,
      }}
    >
      <div style={navbarStyles.itemsContainer}>
        <div style={navbarStyles.leftItemsContainer}>
          {sections.map((section) => (
            <NavbarItem
              onClick={() => handleSectionChange(section)}
              title={section.title}
              isActive={isSectionActive(section)}
              bold={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
