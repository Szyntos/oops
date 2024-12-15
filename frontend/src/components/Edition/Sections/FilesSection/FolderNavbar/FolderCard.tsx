import { Styles } from "../../../../../utils/Styles";

export type FolderCardProps = {
  title: string;
  onClick: () => void;
  isSelected: boolean;
};

export const FolderCard = ({ title, onClick, isSelected }: FolderCardProps) => {
  return (
    <div style={styles.card} onClick={onClick}>
      <div style={isSelected ? styles.selected : undefined}>{title}</div>
    </div>
  );
};

const styles: Styles = {
  card: {
    padding: 20,
    border: "1px solid black",
    width: 50,
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    fontWeight: "bold",
  },
};
