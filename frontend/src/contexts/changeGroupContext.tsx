import { createContext, useState, ReactNode } from "react";
import { useChangeGroupMutation } from "../graphql/changeGroup.graphql.types";
import { useError } from "../hooks/common/useGlobalError";
import { useApolloClient } from "@apollo/client";
import { ChangeGroupFormValues } from "../components/dialogs/ChangeGroupDialog/ChangeGroupForm";

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
  const [isChangeGroupOpen, setIdChangeGroupOpen] = useState(false);

  const [data, setData] = useState<Data | undefined>(undefined);

  const [formError, setFormError] = useState<string | undefined>(undefined);

  const client = useApolloClient();

  const openChangeGroup = (initData: Data) => {
    setIdChangeGroupOpen(true);
    setData(initData);
  };

  const closeChangeGroup = () => {
    setIdChangeGroupOpen(false);
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
      closeChangeGroup();
    });
  };

  return (
    <ChangeGroupContext.Provider
      value={{
        isChangeGroupOpen,
        openChangeGroup,
        closeChangeGroup,
        data,
        handleChangeGroupConfirm,
        formError,
      }}
    >
      {children}
    </ChangeGroupContext.Provider>
  );
};
