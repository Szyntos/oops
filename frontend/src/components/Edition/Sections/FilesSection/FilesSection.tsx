import { useEffect, useState, useRef } from "react";
import { useFilesLazyQuery } from "../../../../graphql/files.graphql.types";
import { useParams } from "react-router-dom";
import { Folder, FilesNavbar } from "./FilesNavbar";
import { useError } from "../../../../hooks/common/useGlobalError";
import { UPLOAD_FILES_URL } from "../../../../utils/constants";
import { useDeleteFileMutation } from "../../../../graphql/deleteFile.graphql.types";
import { useConfirmPopup } from "../../../../hooks/common/useConfirmPopup";
import { LoadingScreen } from "../../../../screens/Loading/LoadingScreen";
import { ErrorScreen } from "../../../../screens/Error/ErrorScreen";
import { CustomButton } from "../../../CustomButton";
import { coordinatorStyles } from "../../../../utils/utils";
import { CardsSection } from "../../CardsSection";
import { Permissions } from "../SetupButtons";
import { FileCard } from "./FileCard";

const folders: Folder[] = [
  { title: "Łupy", pathPrefix: `image/award` },
  { title: "Skrzynki", pathPrefix: `image/chest` },
  { title: "Grupy", pathPrefix: `image/group` },
  { title: "Poziomy", pathPrefix: `image/level` },
  { title: "Awatary", pathPrefix: `image/user` },
];

export type FileItem = {
  id: string;
  permissions: Permissions;
};
export const FilesSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const { globalErrorWrapper } = useError();

  const [activeFolder, setActiveFolder] = useState<Folder>(folders[0]);
  const [fetchFiles, { loading, error, data, refetch }] = useFilesLazyQuery();

  const files: FileItem[] =
    data?.getFilesGroupedByTypeBySelectedTypes.flatMap((a) =>
      a.files.map((f) => ({ id: f.file.fileId, permissions: f.permissions })),
    ) ?? [];

  useEffect(() => {
    fetchFiles({ variables: { paths: [activeFolder.pathPrefix] } });
  }, [activeFolder, fetchFiles, editionId]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("fileType", activeFolder.pathPrefix);

      globalErrorWrapper(async () => {
        const res = await fetch(UPLOAD_FILES_URL, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);
        refetch();
        event.target.value = "";
      });
    }
  };

  const { openConfirmPopup } = useConfirmPopup();
  const [deleteFile] = useDeleteFileMutation();
  const handleDelete = (imageId: string) => {
    openConfirmPopup(() => {
      globalErrorWrapper(async () => {
        await deleteFile({ variables: { fileId: parseInt(imageId) } });
        refetch();
      });
    });
  };

  if (loading) return <LoadingScreen type="edition" />;
  if (error) return <ErrorScreen type="edition" />;

  return (
    <div>
      <FilesNavbar
        folders={folders}
        active={activeFolder}
        setActive={setActiveFolder}
      />
      <div style={coordinatorStyles.container}>
        <div style={coordinatorStyles.buttonsContainer}>
          <CustomButton onClick={handleUploadClick}>Załącz plik</CustomButton>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <CardsSection
          title={"Pliki"}
          cards={files.map((entry) => (
            <FileCard
              item={entry}
              handleDelete={() => handleDelete(entry.id)}
            />
          ))}
        ></CardsSection>
      </div>
    </div>
  );
};
