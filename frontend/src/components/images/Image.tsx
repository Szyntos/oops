import { FETCH_FILES_URL } from "../../utils/constants";
import { Styles } from "../../utils/Styles";

type ImageProps = {
  id: string | undefined;
  size: number;
  disabled: boolean;
};

export const Image = ({ size, id, disabled }: ImageProps) => {
  return (
    <div style={{ width: size, height: size, opacity: disabled ? 0.6 : 1 }}>
      <img
        src={`${FETCH_FILES_URL}${id}`}
        alt={`Id obrazka ${id}`}
        style={styles.img}
      />
    </div>
  );
};

const styles: Styles = {
  img: {
    width: "100%",
    objectFit: "cover",
  },
};
