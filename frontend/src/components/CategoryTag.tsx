import { Styles } from "../utils/Styles";

type CategoryTagProps = {
  name: string;
  darkColor: string;
  lightColor: string;
};

export const CategoryTag = ({
  name,
  darkColor,
  lightColor,
}: CategoryTagProps) => {
  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: darkColor,
        color: lightColor,
      }}
    >
      {name}
    </div>
  );
};

const styles: Styles = {
  container: {
    padding: 4,
    borderRadius: 4,
    display: "inline-block",
    color: "black",
  },
};
