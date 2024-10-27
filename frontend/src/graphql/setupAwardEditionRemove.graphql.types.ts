import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupAwardEditionRemoveMutationVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
  awardId: Types.Scalars["Int"]["input"];
}>;

export type SetupAwardEditionRemoveMutation = {
  __typename?: "mutation_root";
  removeAwardFromEdition?: boolean | null;
};

export const SetupAwardEditionRemoveDocument = gql`
  mutation SetupAwardEditionRemove($editionId: Int!, $awardId: Int!) {
    removeAwardFromEdition(awardId: $awardId, editionId: $editionId)
  }
`;
export type SetupAwardEditionRemoveMutationFn = Apollo.MutationFunction<
  SetupAwardEditionRemoveMutation,
  SetupAwardEditionRemoveMutationVariables
>;

/**
 * __useSetupAwardEditionRemoveMutation__
 *
 * To run a mutation, you first call `useSetupAwardEditionRemoveMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupAwardEditionRemoveMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupAwardEditionRemoveMutation, { data, loading, error }] = useSetupAwardEditionRemoveMutation({
 *   variables: {
 *      editionId: // value for 'editionId'
 *      awardId: // value for 'awardId'
 *   },
 * });
 */
export function useSetupAwardEditionRemoveMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupAwardEditionRemoveMutation,
    SetupAwardEditionRemoveMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupAwardEditionRemoveMutation,
    SetupAwardEditionRemoveMutationVariables
  >(SetupAwardEditionRemoveDocument, options);
}
export type SetupAwardEditionRemoveMutationHookResult = ReturnType<
  typeof useSetupAwardEditionRemoveMutation
>;
export type SetupAwardEditionRemoveMutationResult =
  Apollo.MutationResult<SetupAwardEditionRemoveMutation>;
export type SetupAwardEditionRemoveMutationOptions = Apollo.BaseMutationOptions<
  SetupAwardEditionRemoveMutation,
  SetupAwardEditionRemoveMutationVariables
>;
