import { Outlet, useParams } from "react-router-dom";
import { Styles } from "../../utils/Styles";
import { EditionScreenNavbar } from "../../components/Edition/EditionScreenNavbar";
import { Dialog } from "@mui/material";
import { CloseHeader } from "../../components/dialogs/CloseHeader";
import { ShowEntryContent } from "../../components/Edition/ShowEntryContent/ShowEntryContent";
import { useEditionSections } from "../../hooks/common/useEditionSection";

export const EditionScreen = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const { isShowDialogOpen, closeShowDialog, selectedEntry } =
    useEditionSections();

  return (
    <div>
      <EditionScreenNavbar editionId={editionId} />
      <div style={styles.screenContainer}>
        <Dialog open={isShowDialogOpen}>
          <CloseHeader onCloseClick={closeShowDialog} />
          <ShowEntryContent selectedEntry={selectedEntry} />
        </Dialog>
        <Outlet />
      </div>
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
};
