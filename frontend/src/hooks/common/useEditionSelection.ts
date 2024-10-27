import { useUser } from "./useUser";

// TODO refactor this to has editionId ?
export function useEditionSelection() {
  const { editions, selectedEdition } = useUser();

  // TODO this should be reworked or deleted

  // TODO will be used later on
  // const handleEditionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   const selectedId = event.target.value;
  //   const selectedEdition = editions.find(
  //     (edition) => edition.editionId === selectedId
  //   );
  //   if (selectedEdition) {
  //     setSelectedEdition(selectedEdition);
  //   }
  // };

  return {
    editions,
    selectedEdition,
    // handleEditionChange,
  };
}
