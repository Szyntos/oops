import { useContext } from "react";
import { OverrideGradeContext } from "../../contexts/overrideGradeContext";

export function useOverrideGrade() {
  const context = useContext(OverrideGradeContext);
  if (!context) {
    throw new Error(
      "useOverrideGrade must be used within a OverrideGradeProvider",
    );
  }
  return context;
}
