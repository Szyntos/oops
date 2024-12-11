import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeactivateChestMutationVariables = Types.Exact<{
  chestId: Types.Scalars["Int"]["input"];
  editionId: Types.Scalars["Int"]["input"];
}>;

export type DeactivateChestMutation = {
  __typename?: "mutation_root";
  deactivateChestInEdition?: boolean | null;
};

export const DeactivateChestDocument = gql`
  mutation DeactivateChest($chestId: Int!, $editionId: Int!) {
    deactivateChestInEdition(chestId: $chestId, editionId: $editionId)
  }
`;
export type DeactivateChestMutationFn = Apollo.MutationFunction<
  DeactivateChestMutation,
  DeactivateChestMutationVariables
>;

/**
 * __useDeactivateChestMutation__
 *
 * To run a mutation, you first call `useDeactivateChestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeactivateChestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deactivateChestMutation, { data, loading, error }] = useDeactivateChestMutation({
 *   variables: {
 *      chestId: // value for 'chestId'
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useDeactivateChestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeactivateChestMutation,
    DeactivateChestMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeactivateChestMutation,
    DeactivateChestMutationVariables
  >(DeactivateChestDocument, options);
}
export type DeactivateChestMutationHookResult = ReturnType<
  typeof useDeactivateChestMutation
>;
export type DeactivateChestMutationResult =
  Apollo.MutationResult<DeactivateChestMutation>;
export type DeactivateChestMutationOptions = Apollo.BaseMutationOptions<
  DeactivateChestMutation,
  DeactivateChestMutationVariables
>;
