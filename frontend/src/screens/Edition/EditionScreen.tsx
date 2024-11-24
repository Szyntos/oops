import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Styles } from "../../utils/Styles";
import { pathsGenerator } from "../../router/paths";
import { SectionsBar } from "../../components/Edition/SectionsBar";
import { Dialog } from "@mui/material";
import { CloseHeader } from "../../components/dialogs/CloseHeader";
import { ShowEntryContent } from "../../components/Edition/ShowEntryContent";
import { useEditionSections } from "../../hooks/common/useEditionSection";

export const EditionScreen = () => {
  const navigate = useNavigate();
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const { isShowDialogOpen, closeShowDialog, selectedEntry } =
    useEditionSections();

  return (
    <div style={styles.screenContainer}>
      <div style={styles.header}>
        <button onClick={() => navigate(pathsGenerator.coordinator.Editions)}>
          go back to editions list
        </button>
        <div>params - edition id: {editionId}</div>
      </div>
      <SectionsBar editionId={editionId} />
      <Dialog open={isShowDialogOpen}>
        <CloseHeader onCloseClick={closeShowDialog} />
        <ShowEntryContent selectedEntry={selectedEntry} />
      </Dialog>
      <Outlet />
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
  header: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
