import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupCategoryEditMutationVariables = Types.Exact<{
  categoryId: Types.Scalars["Int"]["input"];
  subcategories: Array<Types.SubcategoryInputType> | Types.SubcategoryInputType;
  categoryName: Types.Scalars["String"]["input"];
  canAddPoints: Types.Scalars["Boolean"]["input"];
}>;

export type SetupCategoryEditMutation = {
  __typename?: "mutation_root";
  editCategory?: { __typename?: "CategoryType"; categoryName: string } | null;
};

export const SetupCategoryEditDocument = gql`
  mutation SetupCategoryEdit(
    $categoryId: Int!
    $subcategories: [SubcategoryInputType!]!
    $categoryName: String!
    $canAddPoints: Boolean!
  ) {
    editCategory(
      categoryId: $categoryId
      subcategories: $subcategories
      categoryName: $categoryName
      canAddPoints: $canAddPoints
    ) {
      categoryName
    }
  }
`;
export type SetupCategoryEditMutationFn = Apollo.MutationFunction<
  SetupCategoryEditMutation,
  SetupCategoryEditMutationVariables
>;

/**
 * __useSetupCategoryEditMutation__
 *
 * To run a mutation, you first call `useSetupCategoryEditMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupCategoryEditMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupCategoryEditMutation, { data, loading, error }] = useSetupCategoryEditMutation({
 *   variables: {
 *      categoryId: // value for 'categoryId'
 *      subcategories: // value for 'subcategories'
 *      categoryName: // value for 'categoryName'
 *      canAddPoints: // value for 'canAddPoints'
 *   },
 * });
 */
export function useSetupCategoryEditMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupCategoryEditMutation,
    SetupCategoryEditMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupCategoryEditMutation,
    SetupCategoryEditMutationVariables
  >(SetupCategoryEditDocument, options);
}
export type SetupCategoryEditMutationHookResult = ReturnType<
  typeof useSetupCategoryEditMutation
>;
export type SetupCategoryEditMutationResult =
  Apollo.MutationResult<SetupCategoryEditMutation>;
export type SetupCategoryEditMutationOptions = Apollo.BaseMutationOptions<
  SetupCategoryEditMutation,
  SetupCategoryEditMutationVariables
>;
