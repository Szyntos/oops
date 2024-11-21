import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
import { Image } from "../../../../images/Image";

type ImagesListProps = {
  imageIds: string[];
  title: string;
  handleDelete: (imageId: string) => void;
};

export const ImagesList = ({
  imageIds,
  title,
  handleDelete,
}: ImagesListProps) => {
  return (
    <div>
      <div style={styles.title}>{title}</div>
      <div style={styles.container}>
        {imageIds.length !== 0
          ? imageIds.map((id) => (
              <div style={styles.imageContainer}>
                <Image id={id} size={128} disabled={false} />
                <button onClick={() => handleDelete(id)}>delete</button>
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
