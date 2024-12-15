import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupGradingChecksDeleteMutationVariables = Types.Exact<{
  gradingChecksId: Types.Scalars["Int"]["input"];
}>;

export type SetupGradingChecksDeleteMutation = {
  __typename?: "mutation_root";
  removeGradingCheck?: boolean | null;
};

export const SetupGradingChecksDeleteDocument = gql`
  mutation SetupGradingChecksDelete($gradingChecksId: Int!) {
    removeGradingCheck(gradingCheckId: $gradingChecksId)
  }
`;
export type SetupGradingChecksDeleteMutationFn = Apollo.MutationFunction<
  SetupGradingChecksDeleteMutation,
  SetupGradingChecksDeleteMutationVariables
>;

/**
 * __useSetupGradingChecksDeleteMutation__
 *
 * To run a mutation, you first call `useSetupGradingChecksDeleteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupGradingChecksDeleteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupGradingChecksDeleteMutation, { data, loading, error }] = useSetupGradingChecksDeleteMutation({
 *   variables: {
 *      gradingChecksId: // value for 'gradingChecksId'
 *   },
 * });
 */
export function useSetupGradingChecksDeleteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupGradingChecksDeleteMutation,
    SetupGradingChecksDeleteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupGradingChecksDeleteMutation,
    SetupGradingChecksDeleteMutationVariables
  >(SetupGradingChecksDeleteDocument, options);
}
export type SetupGradingChecksDeleteMutationHookResult = ReturnType<
  typeof useSetupGradingChecksDeleteMutation
>;
export type SetupGradingChecksDeleteMutationResult =
  Apollo.MutationResult<SetupGradingChecksDeleteMutation>;
export type SetupGradingChecksDeleteMutationOptions =
  Apollo.BaseMutationOptions<
    SetupGradingChecksDeleteMutation,
    SetupGradingChecksDeleteMutationVariables
  >;
