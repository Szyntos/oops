import { useContext } from "react";
import { ChangeGroupContext } from "../../contexts/changeGroupContext";

export function useChangeGroup() {
  const context = useContext(ChangeGroupContext);
  if (!context) {
    throw new Error("useChangeGroup must be used within a ChangeGroupProvider");
  }
  return context;
}