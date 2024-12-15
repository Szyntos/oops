import { createContext, useState, ReactNode } from "react";
import { useError } from "../hooks/common/useGlobalError";
import { useApolloClient } from "@apollo/client";
import { useOverrideGradeMutation } from "../graphql/overrideGrade.graphql.types";
import { OverrideGradeFormValues } from "../components/dialogs/OverrideGradeDialog/OverrideGradeForm";

type OverrideGradeContextType = {
  isOverrideGradeOpen: boolean;
  handleOverrideGradeConfirm: (values: OverrideGradeFormValues) => void;
  openOverrideGrade: (initData: Data) => void;
  closeOverrideGrade: () => void;
  formError: string | undefined;
  data: Data | undefined;
};

export const OverrideGradeContext = createContext<
  OverrideGradeContextType | undefined
>(undefined);

type Data = {
  studentId: string;
  editionId: string;
  grade: string;
};
export const OverrideGradeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isOverrideGradeOpen, setIdOverrideGradeOpen] = useState(false);
  const [data, setData] = useState<Data | undefined>(undefined);
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const client = useApolloClient();

  const openOverrideGrade = (data: Data) => {
    setIdOverrideGradeOpen(true);
    setData(data);
  };

  const closeOverrideGrade = () => {
    setIdOverrideGradeOpen(false);
    setData(undefined);
    setFormError(undefined);
  };

  const { localErrorWrapper } = useError();
  const [overrideGrade] = useOverrideGradeMutation();
  const handleOverrideGradeConfirm = (values: OverrideGradeFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await overrideGrade({
        variables: {
          editionId: parseInt(data?.editionId as string),
          grade: parseInt(values.grade),
          userId: parseInt(data?.studentId as string),
        },
      });
      await client.refetchQueries({
        include: "active",
      });
      closeOverrideGrade();
    });
  };

  return (
    <OverrideGradeContext.Provider
      value={{
        isOverrideGradeOpen,
        openOverrideGrade,
        closeOverrideGrade,
        data,
        handleOverrideGradeConfirm,
        formError,
      }}
    >
      {children}
    </OverrideGradeContext.Provider>
  );
};
