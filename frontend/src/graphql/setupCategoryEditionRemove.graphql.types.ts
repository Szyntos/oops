import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupCategoryEditionRemoveMutationVariables = Types.Exact<{
  categoryId: Types.Scalars["Int"]["input"];
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupCategoryEditionRemoveMutation = {
  __typename?: "mutation_root";
  removeCategoryFromEdition?: boolean | null;
};

export const SetupCategoryEditionRemoveDocument = gql`
  mutation SetupCategoryEditionRemove($categoryId: Int!, $editionId: Int!) {
    removeCategoryFromEdition(categoryId: $categoryId, editionId: $editionId)
  }
`;
export type SetupCategoryEditionRemoveMutationFn = Apollo.MutationFunction<
  SetupCategoryEditionRemoveMutation,
  SetupCategoryEditionRemoveMutationVariables
>;

/**
 * __useSetupCategoryEditionRemoveMutation__
 *
 * To run a mutation, you first call `useSetupCategoryEditionRemoveMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupCategoryEditionRemoveMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupCategoryEditionRemoveMutation, { data, loading, error }] = useSetupCategoryEditionRemoveMutation({
 *   variables: {
 *      categoryId: // value for 'categoryId'
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupCategoryEditionRemoveMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupCategoryEditionRemoveMutation,
    SetupCategoryEditionRemoveMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupCategoryEditionRemoveMutation,
    SetupCategoryEditionRemoveMutationVariables
  >(SetupCategoryEditionRemoveDocument, options);
}
export type SetupCategoryEditionRemoveMutationHookResult = ReturnType<
  typeof useSetupCategoryEditionRemoveMutation
>;
export type SetupCategoryEditionRemoveMutationResult =
  Apollo.MutationResult<SetupCategoryEditionRemoveMutation>;
export type SetupCategoryEditionRemoveMutationOptions =
  Apollo.BaseMutationOptions<
    SetupCategoryEditionRemoveMutation,
    SetupCategoryEditionRemoveMutationVariables
  >;
