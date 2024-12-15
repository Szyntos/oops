import { Styles } from "../../utils/Styles";

type NotEditableInfoProps = {
  hasEditableRights: boolean;
  isSelectedEditionActive: boolean;
};
export const NotEditableInfo = ({
  hasEditableRights,
  isSelectedEditionActive,
}: NotEditableInfoProps) => {
  return (
    <div style={styles.card}>
      <div style={styles.title}>
        Nie możesz zarządzać punktami tego studenta, bo:
      </div>
      <div style={styles.reasonsContainer}>
        {!hasEditableRights && <div>- nie jesteś nauczycielem jego grupy</div>}
        {!isSelectedEditionActive && (
          <div>- wybrana edycja nie jest aktywna</div>
        )}
      </div>
    </div>
  );
};

const styles: Styles = {
  card: {
    border: "1px solid red",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  title: {
    fontWeight: "bold",
  },
  reasonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
};
