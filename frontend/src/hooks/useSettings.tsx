import { useState } from "react";
import { useUser } from "./common/useUser";

export const useSettings = () => {
  const { editions, setSelectedEdition } = useUser();

  const [AreSettingsOpen, setAreSettingsOpen] = useState(false);
  const openSettings = () => {
    setAreSettingsOpen(true);
  };
  const closeSettings = () => {
    setAreSettingsOpen(false);
  };

  const handleChangeEditionConfirm = async (editionId: string) => {
    const e = editions.find((ee) => ee.editionId === editionId);
    setSelectedEdition(e);
  };

  return {
    editions,
    AreSettingsOpen,
    openSettings,
    closeSettings,
    handleChangeEditionConfirm,
  };
};
