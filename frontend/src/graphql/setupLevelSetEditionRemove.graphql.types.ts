import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupLevelSetEditionRemoveMutationVariables = Types.Exact<{
  levelSetId: Types.Scalars["Int"]["input"];
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupLevelSetEditionRemoveMutation = {
  __typename?: "mutation_root";
  removeLevelSetFromEdition?: boolean | null;
};

export const SetupLevelSetEditionRemoveDocument = gql`
  mutation SetupLevelSetEditionRemove($levelSetId: Int!, $editionId: Int!) {
    removeLevelSetFromEdition(levelSetId: $levelSetId, editionId: $editionId)
  }
`;
export type SetupLevelSetEditionRemoveMutationFn = Apollo.MutationFunction<
  SetupLevelSetEditionRemoveMutation,
  SetupLevelSetEditionRemoveMutationVariables
>;

/**
 * __useSetupLevelSetEditionRemoveMutation__
 *
 * To run a mutation, you first call `useSetupLevelSetEditionRemoveMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupLevelSetEditionRemoveMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupLevelSetEditionRemoveMutation, { data, loading, error }] = useSetupLevelSetEditionRemoveMutation({
 *   variables: {
 *      levelSetId: // value for 'levelSetId'
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupLevelSetEditionRemoveMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupLevelSetEditionRemoveMutation,
    SetupLevelSetEditionRemoveMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupLevelSetEditionRemoveMutation,
    SetupLevelSetEditionRemoveMutationVariables
  >(SetupLevelSetEditionRemoveDocument, options);
}
export type SetupLevelSetEditionRemoveMutationHookResult = ReturnType<
  typeof useSetupLevelSetEditionRemoveMutation
>;
export type SetupLevelSetEditionRemoveMutationResult =
  Apollo.MutationResult<SetupLevelSetEditionRemoveMutation>;
export type SetupLevelSetEditionRemoveMutationOptions =
  Apollo.BaseMutationOptions<
    SetupLevelSetEditionRemoveMutation,
    SetupLevelSetEditionRemoveMutationVariables
  >;
