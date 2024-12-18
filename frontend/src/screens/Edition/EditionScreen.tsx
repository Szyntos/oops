import { useParams } from "react-router-dom";
import { Styles } from "../../utils/Styles";
import { EditionScreenNavbar } from "../../components/Edition/EditionScreenNavbar";
import { ShowEntryContent } from "../../components/Edition/ShowEntryContent/ShowEntryContent";
import { useEditionSections } from "../../hooks/common/useEditionSection";
import { CustomDialog } from "../../components/dialogs/CustomDialog";

export const EDITION_MARGIN_VERTICAL = 20;

export const EditionScreen = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const { isShowDialogOpen, closeShowDialog, selectedEntry } =
    useEditionSections();

  return (
    <div>
      <EditionScreenNavbar editionId={editionId} />
      <div style={styles.screenContainer}>
        <CustomDialog
          isOpen={isShowDialogOpen}
          title="JSON"
          onCloseClick={closeShowDialog}
        >
          <ShowEntryContent selectedEntry={selectedEntry} />
        </CustomDialog>
      </div>
    </div>
  );
};

const styles: Styles = {
  screenContainer: {
    margin: 12,
    marginTop: EDITION_MARGIN_VERTICAL,
    marginBottom: EDITION_MARGIN_VERTICAL,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};
