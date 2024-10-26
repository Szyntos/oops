import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
import { Image } from "../../../../images/Image";

type ImagesListProps = {
  imageIds: string[];
  title: string;
};

export const ImagesList = ({ imageIds, title }: ImagesListProps) => {
  return (
    <div>
      <div style={styles.title}>{title}</div>
      <div style={styles.container}>
        {imageIds.length !== 0
          ? imageIds.map((id) => (
              <div>
                <Image id={id} size={128} disabled={false} />
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
  title: {
    color: "blue",
  },
};
