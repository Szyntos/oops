import { useState } from "react";
import { Styles } from "../utils/Styles";
import { Chest } from "../hooks/chest/useChests";
import { tokens } from "../tokens";
import { CustomImage } from "./images/CustomImage";

type OpenChestProps = {
  chest: Chest;
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

  const handleAwardClick = (award: Award) => {
    const isSelected = selectedAwards.some((id) => id === award.awardId);
    if (!isSelected && selectedAwards.length > chest.chest.awardBundleCount) {
      return;
    }
    setSelectedAwards((prev) =>
      isSelected
        ? prev.filter((id) => id !== award.awardId)
        : [...prev, award.awardId],
    );
  };
  return (
    <div style={styles.container}>
      <div style={styles.title}>{chest.chest.type}</div>
      <div>select {chest.chest.awardBundleCount} awards :)</div>

      <div style={styles.awardsContainer}>
        {chest.chest.chestAwards.map((a) => (
          <div onClick={() => handleAwardClick(a.award)}>
            <CustomImage
              id={a.award.imageFileId ?? undefined}
              size={"l"}
              disabled={!selectedAwards.some((id) => id === a.award.awardId)}
            />
          </div>
        ))}
      </div>

      {chestError && <div style={styles.error}>{chestError}</div>}

      <button
        onClick={() =>
          handleOpenChestClick(selectedAwards, chest.chestHistoryId)
        }
      >
        confirm
      </button>
    </div>
  );
};

const styles: Styles = {
  title: {
    fontWeight: "bold",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    width: 300,
    padding: 12,
    gap: 20,
  },
  awardsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
  error: {
    color: tokens.color.state.error,
  },
};
