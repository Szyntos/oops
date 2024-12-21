import { ChangeEvent, useState } from "react";
import { TextInput } from "../inputs/TextInput";

type SearchStudentProps = {
  onInputChange: (input: string) => void;
  placeholder: string;
};

export const StudentsListSearcher = ({
  onInputChange,
  placeholder,
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
      name={"searchStudent"}
      placeholder={placeholder}
    />
  );
};
