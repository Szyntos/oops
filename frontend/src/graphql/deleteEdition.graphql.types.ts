import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteEditionMutationVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
}>;

export type DeleteEditionMutation = {
  __typename?: "mutation_root";
  removeEdition?: boolean | null;
};

export const DeleteEditionDocument = gql`
  mutation DeleteEdition($editionId: Int!) {
    removeEdition(editionId: $editionId)
  }
`;
export type DeleteEditionMutationFn = Apollo.MutationFunction<
  DeleteEditionMutation,
  DeleteEditionMutationVariables
>;

/**
 * __useDeleteEditionMutation__
 *
 * To run a mutation, you first call `useDeleteEditionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteEditionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteEditionMutation, { data, loading, error }] = useDeleteEditionMutation({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useDeleteEditionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteEditionMutation,
    DeleteEditionMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteEditionMutation,
    DeleteEditionMutationVariables
  >(DeleteEditionDocument, options);
}
export type DeleteEditionMutationHookResult = ReturnType<
  typeof useDeleteEditionMutation
>;
export type DeleteEditionMutationResult =
  Apollo.MutationResult<DeleteEditionMutation>;
export type DeleteEditionMutationOptions = Apollo.BaseMutationOptions<
  DeleteEditionMutation,
  DeleteEditionMutationVariables
>;
