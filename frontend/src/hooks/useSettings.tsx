import { useState } from "react";
import { useUser } from "./common/useUser";

export const useSettings = () => {
  const { editions, changeSelectedEdition } = useUser();

  const [AreSettingsOpen, setAreSettingsOpen] = useState(false);
  const openSettings = () => {
    setAreSettingsOpen(true);
  };
  const closeSettings = () => {
    setAreSettingsOpen(false);
  };

  const handleChangeEditionConfirm = async (editionId: string) => {
    const e = editions.find((ee) => ee.editionId === editionId);
    changeSelectedEdition(e);
  };

  return {
    editions,
    AreSettingsOpen,
    openSettings,
    closeSettings,
    handleChangeEditionConfirm,
  };
};
