import { useContext } from "react";
import { EditionContext } from "../../contexts/editionContext";

export function useEdition() {
  const context = useContext(EditionContext);
  if (!context) {
    throw new Error("useEdition must be used within a EditionProvider");
  }
  return context;
}
