import { useState } from "react";
import { useUser } from "./common/useUser";
import { useNavigate } from "react-router-dom";
import { UsersRolesType } from "../__generated__/schema.graphql.types";
import { pathsGenerator } from "../router/paths";

export const useSettings = () => {
  const { editions, changeSelectedEdition, user } = useUser();
  const navigate = useNavigate();

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
    closeSettings();
    if (user.role === UsersRolesType.Student) {
      navigate(pathsGenerator.student.HallOfFame);
    } else {
      navigate(pathsGenerator.teacher.Groups);
    }
  };

  return {
    editions,
    AreSettingsOpen,
    openSettings,
    closeSettings,
    handleChangeEditionConfirm,
  };
};
