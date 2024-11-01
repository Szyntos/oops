import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteAwardMutationVariables = Types.Exact<{
  awardId: Types.Scalars["Int"]["input"];
}>;

export type DeleteAwardMutation = {
  __typename?: "mutation_root";
  removeAward?: boolean | null;
};

export const DeleteAwardDocument = gql`
  mutation DeleteAward($awardId: Int!) {
    removeAward(awardId: $awardId)
  }
`;
export type DeleteAwardMutationFn = Apollo.MutationFunction<
  DeleteAwardMutation,
  DeleteAwardMutationVariables
>;

/**
 * __useDeleteAwardMutation__
 *
 * To run a mutation, you first call `useDeleteAwardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAwardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAwardMutation, { data, loading, error }] = useDeleteAwardMutation({
 *   variables: {
 *      awardId: // value for 'awardId'
 *   },
 * });
 */
export function useDeleteAwardMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteAwardMutation,
    DeleteAwardMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteAwardMutation, DeleteAwardMutationVariables>(
    DeleteAwardDocument,
    options,
  );
}
export type DeleteAwardMutationHookResult = ReturnType<
  typeof useDeleteAwardMutation
>;
export type DeleteAwardMutationResult =
  Apollo.MutationResult<DeleteAwardMutation>;
export type DeleteAwardMutationOptions = Apollo.BaseMutationOptions<
  DeleteAwardMutation,
  DeleteAwardMutationVariables
>;
