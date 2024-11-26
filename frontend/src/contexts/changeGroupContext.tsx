import { createContext, useState, ReactNode } from "react";
import { useChangeGroupMutation } from "../graphql/changeGroup.graphql.types";
import { useError } from "../hooks/common/useGlobalError";
import { useApolloClient } from "@apollo/client";
import { ChangeGroupFormValues } from "../components/dialogs/ChangeGroupContent/ChangeGroupForm";

type ChangeGroupContextType = {
  isChangeGroupOpen: boolean;
  handleChangeGroupConfirm: (values: ChangeGroupFormValues) => void;
  openChangeGroup: (initData: Data) => void;
  closeChangeGroup: () => void;
  data: Data | undefined;
  formError: string | undefined;
};

export const ChangeGroupContext = createContext<
  ChangeGroupContextType | undefined
>(undefined);

type Data = {
  studentId: string;
  groupId: string;
  editionId: string;
};

export const ChangeGroupProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [data, setData] = useState<Data | undefined>(undefined);

  const [formError, setFormError] = useState<string | undefined>(undefined);

  const client = useApolloClient();

  const open = (initData: Data) => {
    setIsOpen(true);
    setData(initData);
  };

  const close = () => {
    setIsOpen(false);
    setData(undefined);
    setFormError(undefined);
  };

  const { localErrorWrapper } = useError();
  const [changeGroup] = useChangeGroupMutation();
  const handleChangeGroupConfirm = (values: ChangeGroupFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await changeGroup({
        variables: {
          groupId: parseInt(values.groupId),
          userId: parseInt(data?.studentId as string),
        },
      });
      await client.refetchQueries({
        include: "active",
      });
      close();
    });
  };

  return (
    <ChangeGroupContext.Provider
      value={{
        isChangeGroupOpen: isOpen,
        openChangeGroup: open,
        closeChangeGroup: close,
        data,
        handleChangeGroupConfirm,
        formError,
      }}
    >
      {children}
    </ChangeGroupContext.Provider>
  );
};
