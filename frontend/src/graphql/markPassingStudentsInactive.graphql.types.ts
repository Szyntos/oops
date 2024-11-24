import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type MarkPassingStudentsInactiveMutationVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
}>;

export type MarkPassingStudentsInactiveMutation = {
  __typename?: "mutation_root";
  markPassingStudentsFromEditionAsInactive?: boolean | null;
};

export const MarkPassingStudentsInactiveDocument = gql`
  mutation MarkPassingStudentsInactive($editionId: Int!) {
    markPassingStudentsFromEditionAsInactive(editionId: $editionId)
  }
`;
export type MarkPassingStudentsInactiveMutationFn = Apollo.MutationFunction<
  MarkPassingStudentsInactiveMutation,
  MarkPassingStudentsInactiveMutationVariables
>;

/**
 * __useMarkPassingStudentsInactiveMutation__
 *
 * To run a mutation, you first call `useMarkPassingStudentsInactiveMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkPassingStudentsInactiveMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markPassingStudentsInactiveMutation, { data, loading, error }] = useMarkPassingStudentsInactiveMutation({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useMarkPassingStudentsInactiveMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MarkPassingStudentsInactiveMutation,
    MarkPassingStudentsInactiveMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MarkPassingStudentsInactiveMutation,
    MarkPassingStudentsInactiveMutationVariables
  >(MarkPassingStudentsInactiveDocument, options);
}
export type MarkPassingStudentsInactiveMutationHookResult = ReturnType<
  typeof useMarkPassingStudentsInactiveMutation
>;
export type MarkPassingStudentsInactiveMutationResult =
  Apollo.MutationResult<MarkPassingStudentsInactiveMutation>;
export type MarkPassingStudentsInactiveMutationOptions =
  Apollo.BaseMutationOptions<
    MarkPassingStudentsInactiveMutation,
    MarkPassingStudentsInactiveMutationVariables
  >;
