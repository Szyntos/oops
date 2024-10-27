import { useNavigate, useParams } from "react-router-dom";
import { Styles } from "../../utils/Styles";
import { pathsGenerator } from "../../router/paths";
import { SectionsBar } from "../../components/Edition/SectionsBar";
import { useState } from "react";
import { AwardsSection } from "../../components/Edition/Sections/AwardsSection/AwardsSection";
import { CategoriesSection } from "../../components/Edition/Sections/CategoriesSection/CategoriesSection";
import { GroupsSection } from "../../components/Edition/Sections/GroupSection/GroupsSection";
import { LevelsSection } from "../../components/Edition/Sections/LevelsSection/LevelsSection";
import { FilesSection } from "../../components/Edition/Sections/FilesSection/FilesSection";
import { ChestsSection } from "../../components/Edition/Sections/ChestsSection/ChestsSection";
import { UsersSection } from "../../components/Edition/Sections/UsersSection/UsersSection";

export type SectionTitle =
  | "awards"
  | "categories"
  | "chests"
  | "group"
  | "levels"
  | "files"
  | "users";

const sectionTitles: SectionTitle[] = [
  "awards",
  "categories",
  "chests",
  "group",
  "users",
  "levels",
  "files",
];

export const EditionScreen = () => {
  const navigate = useNavigate();
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : undefined;

  if (editionId === undefined) {
    throw new Error("editionId cannot be undefined");
  }

  const [activeSectionTitle, setActiveSectionTitle] =
    useState<SectionTitle>("categories");

  const getSectionComponent = () => {
    switch (activeSectionTitle) {
      case "awards":
        return <AwardsSection editionId={editionId} />;
      case "categories":
        return <CategoriesSection editionId={editionId} />;
      case "chests":
        return <ChestsSection editionId={editionId} />;
      case "group":
        return <GroupsSection editionId={editionId} />;
      case "users":
        return <UsersSection editionId={editionId} />;
      case "levels":
        return <LevelsSection editionId={editionId} />;
      case "files":
        return <FilesSection editionId={editionId} />;
      default:
        return null;
    }
  };

  return (
    <div style={styles.screenContainer}>
      <div style={styles.header}>
        <button onClick={() => navigate(pathsGenerator.coordinator.Editions)}>
          go back to editions list
        </button>
        <div>params - edition id: {editionId}</div>
      </div>
      <SectionsBar
        sections={sectionTitles}
        activeSectionTitle={activeSectionTitle}
        onActiveChange={(section) => setActiveSectionTitle(section)}
      />
      {getSectionComponent()}
    </div>
  );
};

const styles: Styles = {
  screenContainer: {
    margin: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
