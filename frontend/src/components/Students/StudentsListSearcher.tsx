import { ChangeEvent, useState } from "react";
import { TextInput } from "../inputs/TextInput";

type SearchStudentProps = {
  onInputChange: (input: string) => void;
};

export const StudentsListSearcher = ({ onInputChange }: SearchStudentProps) => {
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
      name={"searchStudent"}
      placeholder="wyszukaj studenta"
    />
  );
};
