import { useState } from "react";
import { Styles } from "../../../utils/Styles";
import { Section } from "../../StudentProfile/cards/Section/Section";
import { Checkbox, FormControlLabel } from "@mui/material";
import { tokens } from "../../../tokens";
import { CustomText } from "../../CustomText";

export type FilterItem = {
  id: string;
  name: string;
};

export type FilterOptionsSectionProps = {
  pickerTitle: string;
  options: FilterItem[];
  onFiltersChange: (selectedIds: string[]) => void;
};

export const FilterOptionsSection = ({
  pickerTitle,
  options,
  onFiltersChange,
}: FilterOptionsSectionProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleOptionChange = (optionId: string) => {
    const updatedIds = selectedIds.includes(optionId)
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];

    setSelectedIds(updatedIds);
    onFiltersChange(updatedIds);
  };

  return (
    <Section title={pickerTitle}>
      <div style={styles.optionsContainer}>
        {options.map((option) => (
          <div key={option.id} style={styles.optionContainer}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedIds.includes(option.id)}
                  onChange={() => handleOptionChange(option.id)}
                  sx={{
                    color: tokens.color.text.secondary,
                    "&.Mui-checked": {
                      color: tokens.color.accent.dark,
                    },
                    padding: 0,
                  }}
                />
              }
              label={<CustomText>{option.name}</CustomText>}
              sx={{
                display: "flex",
                gap: "6px",
                alignItems: "center",
                transform: "translateX(11px)",
              }}
            />
          </div>
        ))}
      </div>
    </Section>
  );
};

const styles: Styles = {
  optionsContainer: {
    gap: 8,
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
  },
};
