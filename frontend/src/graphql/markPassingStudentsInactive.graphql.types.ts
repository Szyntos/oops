import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type MarkPAssingStudentsInactiveMutationVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
}>;

export type MarkPAssingStudentsInactiveMutation = {
  __typename?: "mutation_root";
  markPassingStudentsFromEditionAsInactive?: boolean | null;
};

export const MarkPAssingStudentsInactiveDocument = gql`
  mutation MarkPAssingStudentsInactive($editionId: Int!) {
    markPassingStudentsFromEditionAsInactive(editionId: $editionId)
  }
`;
export type MarkPAssingStudentsInactiveMutationFn = Apollo.MutationFunction<
  MarkPAssingStudentsInactiveMutation,
  MarkPAssingStudentsInactiveMutationVariables
>;

/**
 * __useMarkPAssingStudentsInactiveMutation__
 *
 * To run a mutation, you first call `useMarkPAssingStudentsInactiveMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkPAssingStudentsInactiveMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markPAssingStudentsInactiveMutation, { data, loading, error }] = useMarkPAssingStudentsInactiveMutation({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useMarkPAssingStudentsInactiveMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MarkPAssingStudentsInactiveMutation,
    MarkPAssingStudentsInactiveMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MarkPAssingStudentsInactiveMutation,
    MarkPAssingStudentsInactiveMutationVariables
  >(MarkPAssingStudentsInactiveDocument, options);
}
export type MarkPAssingStudentsInactiveMutationHookResult = ReturnType<
  typeof useMarkPAssingStudentsInactiveMutation
>;
export type MarkPAssingStudentsInactiveMutationResult =
  Apollo.MutationResult<MarkPAssingStudentsInactiveMutation>;
export type MarkPAssingStudentsInactiveMutationOptions =
  Apollo.BaseMutationOptions<
    MarkPAssingStudentsInactiveMutation,
    MarkPAssingStudentsInactiveMutationVariables
  >;
