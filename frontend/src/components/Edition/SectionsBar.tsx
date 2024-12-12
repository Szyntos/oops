import { Styles } from "../../utils/Styles";
import { pathsGenerator } from "../../router/paths";
import { useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../tokens";

type SectionBarProps = {
  editionId: number;
};

export type Section = {
  title:
    | "awards"
    | "categories"
    | "chests"
    | "groups"
    | "levels"
    | "files"
    | "users"
    | "grading checks";

  path: (editionId: string) => string;
};

const sections: Section[] = [
  {
    title: "categories",
    path: pathsGenerator.coordinator.EditionChildren.Categories,
  },
  {
    title: "levels",
    path: pathsGenerator.coordinator.EditionChildren.Levels,
  },
  {
    title: "grading checks",
    path: pathsGenerator.coordinator.EditionChildren.GradingChecks,
  },
  {
    title: "awards",
    path: pathsGenerator.coordinator.EditionChildren.Awards,
  },
  {
    title: "chests",
    path: pathsGenerator.coordinator.EditionChildren.Chests,
  },
  {
    title: "users",
    path: pathsGenerator.coordinator.EditionChildren.Users,
  },
  {
    title: "groups",
    path: pathsGenerator.coordinator.EditionChildren.Groups,
  },
  {
    title: "files",
    path: pathsGenerator.coordinator.EditionChildren.Files,
  },
];

export const SectionsBar = ({ editionId }: SectionBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSectionActive = (section: Section) => {
    const activeSection = sections.find(
      (s) => location.pathname === s.path(editionId.toString()),
    );
    if (section.title !== "categories") {
      return activeSection?.title === section.title;
    }
    return !activeSection || activeSection.title === section.title;
  };

  const handleSectionChange = (section: Section) => {
    navigate(section.path(editionId.toString()));
  };

  return (
    <div style={styles.container}>
      {sections.map((section) => (
        <div
          onClick={() => handleSectionChange(section)}
          style={{
            ...styles.section,
            color: isSectionActive(section)
              ? tokens.color.accent.dark
              : tokens.color.state.disabled,
          }}
        >
          {section.title}
        </div>
      ))}
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    borderBottom: "1px solid black",
  },
};
