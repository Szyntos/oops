import { Styles } from "../../../../../utils/Styles";
import { FolderCard } from "./FolderCard";

export type Folder = {
  title: string;
  pathPrefix: string;
};

type FolderNavarProps = {
  folders: Folder[];
  active: Folder;
  setActive: (section: Folder) => void;
};

export const FolderNavbar = ({
  folders,
  active,
  setActive,
}: FolderNavarProps) => {
  return (
    <div style={styles.container}>
      {folders.map((folder) => (
        <FolderCard
          title={folder.title}
          onClick={() => setActive(folder)}
          isSelected={active.title === folder.title}
        />
      ))}
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    gap: 12,
  },
};
