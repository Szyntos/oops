import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteLevelSetMutationVariables = Types.Exact<{
  levelSetId: Types.Scalars["Int"]["input"];
}>;

export type DeleteLevelSetMutation = {
  __typename?: "mutation_root";
  removeLevelSet?: boolean | null;
};

export const DeleteLevelSetDocument = gql`
  mutation DeleteLevelSet($levelSetId: Int!) {
    removeLevelSet(levelSet: $levelSetId)
  }
`;
export type DeleteLevelSetMutationFn = Apollo.MutationFunction<
  DeleteLevelSetMutation,
  DeleteLevelSetMutationVariables
>;

/**
 * __useDeleteLevelSetMutation__
 *
 * To run a mutation, you first call `useDeleteLevelSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteLevelSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteLevelSetMutation, { data, loading, error }] = useDeleteLevelSetMutation({
 *   variables: {
 *      levelSetId: // value for 'levelSetId'
 *   },
 * });
 */
export function useDeleteLevelSetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteLevelSetMutation,
    DeleteLevelSetMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteLevelSetMutation,
    DeleteLevelSetMutationVariables
  >(DeleteLevelSetDocument, options);
}
export type DeleteLevelSetMutationHookResult = ReturnType<
  typeof useDeleteLevelSetMutation
>;
export type DeleteLevelSetMutationResult =
  Apollo.MutationResult<DeleteLevelSetMutation>;
export type DeleteLevelSetMutationOptions = Apollo.BaseMutationOptions<
  DeleteLevelSetMutation,
  DeleteLevelSetMutationVariables
>;
