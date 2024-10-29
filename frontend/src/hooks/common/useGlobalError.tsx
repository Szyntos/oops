import { useEffect, useState } from "react";

export const useError = () => {
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (globalError) {
      alert(globalError);
      setGlobalError(undefined);
    }
  }, [globalError]);

  const globalErrorWrapper = async (foo: () => Promise<void>) => {
    try {
      await foo();
    } catch (err) {
      console.error(err);
      setGlobalError(
        err instanceof Error ? err.message : "Unexpected error received.",
      );
    }
  };

  const localErrorWrapper = async (
    setError: (text: string) => void,
    foo: () => Promise<void>,
  ) => {
    try {
      await foo();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unexpected error received.",
      );
    }
  };

  return { globalErrorWrapper, localErrorWrapper };
};
