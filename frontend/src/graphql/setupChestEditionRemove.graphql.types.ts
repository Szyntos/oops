import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupChestEditionRemoveMutationVariables = Types.Exact<{
  chestId: Types.Scalars["Int"]["input"];
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupChestEditionRemoveMutation = {
  __typename?: "mutation_root";
  removeChestFromEdition?: boolean | null;
};

export const SetupChestEditionRemoveDocument = gql`
  mutation SetupChestEditionRemove($chestId: Int!, $editionId: Int!) {
    removeChestFromEdition(chestId: $chestId, editionId: $editionId)
  }
`;
export type SetupChestEditionRemoveMutationFn = Apollo.MutationFunction<
  SetupChestEditionRemoveMutation,
  SetupChestEditionRemoveMutationVariables
>;

/**
 * __useSetupChestEditionRemoveMutation__
 *
 * To run a mutation, you first call `useSetupChestEditionRemoveMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupChestEditionRemoveMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupChestEditionRemoveMutation, { data, loading, error }] = useSetupChestEditionRemoveMutation({
 *   variables: {
 *      chestId: // value for 'chestId'
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupChestEditionRemoveMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupChestEditionRemoveMutation,
    SetupChestEditionRemoveMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupChestEditionRemoveMutation,
    SetupChestEditionRemoveMutationVariables
  >(SetupChestEditionRemoveDocument, options);
}
export type SetupChestEditionRemoveMutationHookResult = ReturnType<
  typeof useSetupChestEditionRemoveMutation
>;
export type SetupChestEditionRemoveMutationResult =
  Apollo.MutationResult<SetupChestEditionRemoveMutation>;
export type SetupChestEditionRemoveMutationOptions = Apollo.BaseMutationOptions<
  SetupChestEditionRemoveMutation,
  SetupChestEditionRemoveMutationVariables
>;
