import { useContext } from "react";
import { EditionSectionsContext } from "../../contexts/editionContext";

export function useEditionSections() {
  const context = useContext(EditionSectionsContext);
  if (!context) {
    throw new Error(
      "useEditionSections must be used within a EditionSectionsProvider",
    );
  }
  return context;
}
