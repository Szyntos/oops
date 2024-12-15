import { useContext } from "react";
import { EditionSectionsContext } from "../../contexts/editionContext";

export function useEditionSections() {
  const context = useContext(EditionSectionsContext);
  if (!context) {
    throw new Error(
      "useEditionSections musi być użyte z EditionSectionsProvider",
    );
  }
  return context;
}
