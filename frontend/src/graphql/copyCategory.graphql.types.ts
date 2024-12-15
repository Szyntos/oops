import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CopyCategoryMutationVariables = Types.Exact<{
  categoryId: Types.Scalars["Int"]["input"];
}>;

export type CopyCategoryMutation = {
  __typename?: "mutation_root";
  copyCategory?: { __typename?: "CategoryType"; categoryId: string } | null;
};

export const CopyCategoryDocument = gql`
  mutation CopyCategory($categoryId: Int!) {
    copyCategory(categoryId: $categoryId) {
      categoryId
    }
  }
`;
export type CopyCategoryMutationFn = Apollo.MutationFunction<
  CopyCategoryMutation,
  CopyCategoryMutationVariables
>;

/**
 * __useCopyCategoryMutation__
 *
 * To run a mutation, you first call `useCopyCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCopyCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [copyCategoryMutation, { data, loading, error }] = useCopyCategoryMutation({
 *   variables: {
 *      categoryId: // value for 'categoryId'
 *   },
 * });
 */
export function useCopyCategoryMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CopyCategoryMutation,
    CopyCategoryMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CopyCategoryMutation,
    CopyCategoryMutationVariables
  >(CopyCategoryDocument, options);
}
export type CopyCategoryMutationHookResult = ReturnType<
  typeof useCopyCategoryMutation
>;
export type CopyCategoryMutationResult =
  Apollo.MutationResult<CopyCategoryMutation>;
export type CopyCategoryMutationOptions = Apollo.BaseMutationOptions<
  CopyCategoryMutation,
  CopyCategoryMutationVariables
>;
