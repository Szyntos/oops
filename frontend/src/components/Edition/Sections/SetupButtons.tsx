type SetupButtonsProps = {
  handleCopy?: <T>(item: T) => void;
  handleSelect?: <T>(item: T) => void;
  handleEdit?: <T>(item: T) => void;
  handleDelete?: <T>(item: T) => void;
  disableCopy?: boolean;
  disableSelect?: boolean;
  disableEdit?: boolean;
  disableDelete?: boolean;
  selected: boolean;
};

export const SetupButtons = ({
  handleCopy,
  handleDelete,
  handleEdit,
  handleSelect,
  disableSelect,
  disableCopy,
  disableDelete,
  disableEdit,
  selected,
}: SetupButtonsProps) => {
  return (
    <div>
      <button disabled={disableSelect} onClick={handleSelect}>
        {selected ? "unselect" : "select"}
      </button>
      <button disabled={disableCopy} onClick={handleCopy}>
        copy
      </button>
      <button disabled={disableEdit} onClick={handleEdit}>
        edit
      </button>
      <button disabled={disableDelete} onClick={handleDelete}>
        delete
      </button>
    </div>
  );
};
