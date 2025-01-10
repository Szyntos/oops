import { Outlet, useParams } from "react-router-dom";
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
      <div>
        <Outlet />

        <CustomDialog
          isOpen={isShowDialogOpen}
          title="JSON"
          onCloseClick={closeShowDialog}
        >
          <ShowEntryContent
            selectedEntry={selectedEntry?.entry}
            type={selectedEntry?.type}
          />
        </CustomDialog>
      </div>
    </div>
  );
};
