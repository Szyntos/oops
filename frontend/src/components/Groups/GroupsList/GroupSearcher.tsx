import { ChangeEvent, useState } from "react";
import { TextInput } from "../../inputs/TextInput";

type SearchStudentProps = {
  onInputChange: (input: string) => void;
};

export const GroupSearchField = ({ onInputChange }: SearchStudentProps) => {
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
      name={"searchGroup"}
      placeholder="Wyszukaj grupę"
    />
  );
};
