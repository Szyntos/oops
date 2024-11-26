import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
import { Image } from "../../../../images/Image";
import { Permissions, SetupButtons } from "../../SetupButtons";

export type FileItem = {
  id: string;
  permissions: Permissions;
};

type ImagesListProps = {
  files: FileItem[];
  title: string;
  handleDelete: (imageId: string) => void;
};

export const ImagesList = ({ files, title, handleDelete }: ImagesListProps) => {
  return (
    <div>
      <div style={styles.title}>{title}</div>
      <div style={styles.container}>
        {files.length !== 0
          ? files.map((entry) => (
              <div style={styles.imageContainer}>
                <Image id={entry.id} size={128} disabled={false} />
                <SetupButtons
                  permissions={entry.permissions}
                  handleDelete={() => handleDelete(entry.id)}
                />
              </div>
            ))
          : EMPTY_FIELD_STRING}
      </div>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageContainer: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    color: "blue",
  },
};
