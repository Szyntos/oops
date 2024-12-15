import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupCategoryCreateMutationVariables = Types.Exact<{
  canAddPoints: Types.Scalars["Boolean"]["input"];
  categoryName: Types.Scalars["String"]["input"];
  subcategories: Array<Types.SubcategoryInputType> | Types.SubcategoryInputType;
}>;

export type SetupCategoryCreateMutation = {
  __typename?: "mutation_root";
  addCategory?: {
    __typename?: "CategoryType";
    categoryId: string;
    categoryName: string;
    darkColor: string;
    lightColor: string;
  } | null;
};

export const SetupCategoryCreateDocument = gql`
  mutation SetupCategoryCreate(
    $canAddPoints: Boolean!
    $categoryName: String!
    $subcategories: [SubcategoryInputType!]!
  ) {
    addCategory(
      canAddPoints: $canAddPoints
      categoryName: $categoryName
      subcategories: $subcategories
    ) {
      categoryId
      categoryName
      darkColor
      lightColor
    }
  }
`;
export type SetupCategoryCreateMutationFn = Apollo.MutationFunction<
  SetupCategoryCreateMutation,
  SetupCategoryCreateMutationVariables
>;

/**
 * __useSetupCategoryCreateMutation__
 *
 * To run a mutation, you first call `useSetupCategoryCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupCategoryCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupCategoryCreateMutation, { data, loading, error }] = useSetupCategoryCreateMutation({
 *   variables: {
 *      canAddPoints: // value for 'canAddPoints'
 *      categoryName: // value for 'categoryName'
 *      subcategories: // value for 'subcategories'
 *   },
 * });
 */
export function useSetupCategoryCreateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupCategoryCreateMutation,
    SetupCategoryCreateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupCategoryCreateMutation,
    SetupCategoryCreateMutationVariables
  >(SetupCategoryCreateDocument, options);
}
export type SetupCategoryCreateMutationHookResult = ReturnType<
  typeof useSetupCategoryCreateMutation
>;
export type SetupCategoryCreateMutationResult =
  Apollo.MutationResult<SetupCategoryCreateMutation>;
export type SetupCategoryCreateMutationOptions = Apollo.BaseMutationOptions<
  SetupCategoryCreateMutation,
  SetupCategoryCreateMutationVariables
>;
