import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupCategoryEditionAddMutationVariables = Types.Exact<{
  categoryId: Types.Scalars["Int"]["input"];
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupCategoryEditionAddMutation = {
  __typename?: "mutation_root";
  addCategoryToEdition?: {
    __typename?: "CategoryEditionType";
    categoryEditionId: string;
    label: string;
  } | null;
};

export const SetupCategoryEditionAddDocument = gql`
  mutation SetupCategoryEditionAdd($categoryId: Int!, $editionId: Int!) {
    addCategoryToEdition(categoryId: $categoryId, editionId: $editionId) {
      categoryEditionId
      label
    }
  }
`;
export type SetupCategoryEditionAddMutationFn = Apollo.MutationFunction<
  SetupCategoryEditionAddMutation,
  SetupCategoryEditionAddMutationVariables
>;

/**
 * __useSetupCategoryEditionAddMutation__
 *
 * To run a mutation, you first call `useSetupCategoryEditionAddMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupCategoryEditionAddMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupCategoryEditionAddMutation, { data, loading, error }] = useSetupCategoryEditionAddMutation({
 *   variables: {
 *      categoryId: // value for 'categoryId'
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupCategoryEditionAddMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupCategoryEditionAddMutation,
    SetupCategoryEditionAddMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupCategoryEditionAddMutation,
    SetupCategoryEditionAddMutationVariables
  >(SetupCategoryEditionAddDocument, options);
}
export type SetupCategoryEditionAddMutationHookResult = ReturnType<
  typeof useSetupCategoryEditionAddMutation
>;
export type SetupCategoryEditionAddMutationResult =
  Apollo.MutationResult<SetupCategoryEditionAddMutation>;
export type SetupCategoryEditionAddMutationOptions = Apollo.BaseMutationOptions<
  SetupCategoryEditionAddMutation,
  SetupCategoryEditionAddMutationVariables
>;
