import { useState } from "react";
import { Styles } from "../utils/Styles";
import { Chest } from "../hooks/chest/useChests";
import { Avatar } from "./avatars/Avatar";
import { formStyles } from "../utils/utils";
import { CustomText } from "./CustomText";
import { FormError } from "./form/FormError";
import { FormButton } from "./form/FormButton";

type OpenChestProps = {
  chest?: Chest;
  handleOpenChestClick: (awardIds: string[], chestId: string) => void;
  chestError: string | undefined;
};

type Award = Chest["chest"]["chestAwards"][number]["award"];

export const OpenChest = ({
  chest,
  handleOpenChestClick,
  chestError,
}: OpenChestProps) => {
  const [selectedAwards, setSelectedAwards] = useState<string[]>([]);

  if (!chest) {
    return <CustomText>Przyznawanie nagród...</CustomText>;
  }

  const handleAwardClick = (award: Award) => {
    const isSelected = selectedAwards.some((id) => id === award.awardId);
    if (
      !isSelected &&
      selectedAwards.length + 1 > chest.chest.awardBundleCount
    ) {
      return;
    }
    setSelectedAwards((prev) =>
      isSelected
        ? prev.filter((id) => id !== award.awardId)
        : [...prev, award.awardId],
    );
  };
  return (
    <div style={formStyles.formContainer}>
      <CustomText style={formStyles.label}>
        Maksymalna liczba nagród do wybrania: {chest.chest.awardBundleCount}
      </CustomText>

      <div style={styles.awardsContainer}>
        {chest.chest.chestAwards.map((a) => (
          <div onClick={() => handleAwardClick(a.award)}>
            <Avatar
              id={a.award.imageFileId ?? undefined}
              size={"l"}
              disabled={!selectedAwards.some((id) => id === a.award.awardId)}
            />
          </div>
        ))}
      </div>

      <FormError error={chestError} isFormError={true} />

      <FormButton
        onClick={() =>
          handleOpenChestClick(selectedAwards, chest.chestHistoryId)
        }
      />
    </div>
  );
};

const styles: Styles = {
  awardsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
};
