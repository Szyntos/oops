import { createContext, useState, ReactNode } from "react";
import { useChangeGroupMutation } from "../graphql/changeGroup.graphql.types";
import { useError } from "../hooks/common/useGlobalError";
import { useApolloClient } from "@apollo/client";

type ChangeGroupContextType = {
  isChangeGroupOpen: boolean;
  handleChangeGroupConfirm: (groupId: string) => void;
  openChangeGroup: (
    studentId: string,
    groupId: string,
    editionId: string,
  ) => void;
  closeChangeGroup: () => void;
  studentId: string | undefined;
  groupId: string | undefined;
  editionId: string | undefined;
  formError: string | undefined;
};

export const ChangeGroupContext = createContext<
  ChangeGroupContextType | undefined
>(undefined);

export const ChangeGroupProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const [studentId, setStudentId] = useState<string | undefined>(undefined);
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [editionId, setEditionId] = useState<string | undefined>(undefined);

  const [formError, setFormError] = useState<string | undefined>(undefined);

  const client = useApolloClient();

  const open = (studentID: string, groupID: string, editionID: string) => {
    setIsOpen(true);
    setStudentId(studentID);
    setGroupId(groupID);
    setEditionId(editionID);
  };

  const close = () => {
    setIsOpen(false);
    setStudentId(undefined);
    setGroupId(undefined);
    setEditionId(undefined);
    setFormError(undefined);
  };

  const { localErrorWrapper } = useError();
  const [changeGroup] = useChangeGroupMutation();
  const handleChangeGroupConfirm = (gID: string | undefined) => {
    localErrorWrapper(setFormError, async () => {
      await changeGroup({
        variables: {
          groupId: parseInt(gID as string),
          userId: parseInt(studentId as string),
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
        studentId,
        groupId,
        editionId,
        handleChangeGroupConfirm,
        formError,
      }}
    >
      {children}
    </ChangeGroupContext.Provider>
  );
};
