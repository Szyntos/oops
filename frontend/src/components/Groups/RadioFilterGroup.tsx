import { FilterButton } from "../FilterButton";

export type GroupRadioFilterItem = { id: string; name: string };

type RadioFilterGroupProps = {
  options: GroupRadioFilterItem[];
  onOptionChange: (option: GroupRadioFilterItem) => void;
  selectedOption: GroupRadioFilterItem;
};

export const RadioFilterGroups = ({
  options,
  onOptionChange,
  selectedOption,
}: RadioFilterGroupProps) => {
  return (
    <>
      {options.map((option) => (
        <FilterButton
          option={option.name}
          isActive={option.id === selectedOption.id}
          onClick={() => onOptionChange(option)}
        />
      ))}
    </>
  );
};
