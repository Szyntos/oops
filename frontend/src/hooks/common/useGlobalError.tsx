import { useCallback, useEffect, useState } from "react";

export const useError = () => {
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (globalError) {
      alert(globalError);
      setGlobalError(undefined);
    }
  }, [globalError]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapError = (err: any): string => {
    return err instanceof Error ? err.message : "Niespodziewany error.";
  };

  const globalErrorWrapper = useCallback(
    async (foo: () => Promise<void> | void) => {
      try {
        await foo();
      } catch (err) {
        console.error(err);
        setGlobalError(mapError(err));
      }
    },
    [],
  );

  const localErrorWrapper = useCallback(
    async (
      setError: (text: string) => void,
      foo: () => Promise<void> | void,
    ) => {
      try {
        await foo();
      } catch (err) {
        console.error(err);
        setError(mapError(err));
      }
    },
    [],
  );

  return { globalErrorWrapper, localErrorWrapper };
};
