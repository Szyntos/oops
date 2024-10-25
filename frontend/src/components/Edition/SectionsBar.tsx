import { Styles } from "../../utils/Styles";
import { pathsGenerator } from "../../router/paths";
import { useLocation, useNavigate } from "react-router-dom";

type SectionBarProps = {
  editionId: number;
};

export type Section = {
  title: "awards" | "categories" | "chests" | "groups" | "levels" | "files";
  path: (editionId: string) => string;
};

const sections: Section[] = [
  {
    title: "awards",
    path: pathsGenerator.coordinator.EditionChildren.Awards,
  },
  {
    title: "chests",
    path: pathsGenerator.coordinator.EditionChildren.Chests,
  },
  {
    title: "categories",
    path: pathsGenerator.coordinator.EditionChildren.Categories,
  },
  {
    title: "files",
    path: pathsGenerator.coordinator.EditionChildren.Files,
  },
  {
    title: "levels",
    path: pathsGenerator.coordinator.EditionChildren.Levels,
  },
  {
    title: "groups",
    path: pathsGenerator.coordinator.EditionChildren.Groups,
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
            color: isSectionActive(section) ? "red" : "grey",
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
