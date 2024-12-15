import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteChestMutationVariables = Types.Exact<{
  chestId: Types.Scalars["Int"]["input"];
}>;

export type DeleteChestMutation = {
  __typename?: "mutation_root";
  removeChest?: boolean | null;
};

export const DeleteChestDocument = gql`
  mutation DeleteChest($chestId: Int!) {
    removeChest(chestId: $chestId)
  }
`;
export type DeleteChestMutationFn = Apollo.MutationFunction<
  DeleteChestMutation,
  DeleteChestMutationVariables
>;

/**
 * __useDeleteChestMutation__
 *
 * To run a mutation, you first call `useDeleteChestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteChestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteChestMutation, { data, loading, error }] = useDeleteChestMutation({
 *   variables: {
 *      chestId: // value for 'chestId'
 *   },
 * });
 */
export function useDeleteChestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteChestMutation,
    DeleteChestMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteChestMutation, DeleteChestMutationVariables>(
    DeleteChestDocument,
    options,
  );
}
export type DeleteChestMutationHookResult = ReturnType<
  typeof useDeleteChestMutation
>;
export type DeleteChestMutationResult =
  Apollo.MutationResult<DeleteChestMutation>;
export type DeleteChestMutationOptions = Apollo.BaseMutationOptions<
  DeleteChestMutation,
  DeleteChestMutationVariables
>;
