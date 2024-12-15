import { ChangeEvent, useState } from "react";
import { TextInput } from "../inputs/TextInput";

type SearchStudentProps = {
  onInputChange: (input: string) => void;
};

export const HallOfFameStudentSearcher = ({
  onInputChange,
}: SearchStudentProps) => {
  const [searchInputValue, setSearchInputValue] = useState("");

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setSearchInputValue(input);
    onInputChange(input);
  };

  return (
    <TextInput
      handleChange={handleSearchInputChange}
      value={searchInputValue}
      name="searchHallOfFameStudent"
      placeholder="Wyszukaj studenta"
    />
  );
};
