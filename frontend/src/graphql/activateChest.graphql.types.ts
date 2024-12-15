import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type ActivateChestMutationVariables = Types.Exact<{
  chestId: Types.Scalars["Int"]["input"];
  editionId: Types.Scalars["Int"]["input"];
}>;

export type ActivateChestMutation = {
  __typename?: "mutation_root";
  activateChestInEdition?: boolean | null;
};

export const ActivateChestDocument = gql`
  mutation ActivateChest($chestId: Int!, $editionId: Int!) {
    activateChestInEdition(chestId: $chestId, editionId: $editionId)
  }
`;
export type ActivateChestMutationFn = Apollo.MutationFunction<
  ActivateChestMutation,
  ActivateChestMutationVariables
>;

/**
 * __useActivateChestMutation__
 *
 * To run a mutation, you first call `useActivateChestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useActivateChestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [activateChestMutation, { data, loading, error }] = useActivateChestMutation({
 *   variables: {
 *      chestId: // value for 'chestId'
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useActivateChestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ActivateChestMutation,
    ActivateChestMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ActivateChestMutation,
    ActivateChestMutationVariables
  >(ActivateChestDocument, options);
}
export type ActivateChestMutationHookResult = ReturnType<
  typeof useActivateChestMutation
>;
export type ActivateChestMutationResult =
  Apollo.MutationResult<ActivateChestMutation>;
export type ActivateChestMutationOptions = Apollo.BaseMutationOptions<
  ActivateChestMutation,
  ActivateChestMutationVariables
>;
