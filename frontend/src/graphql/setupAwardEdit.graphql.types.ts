import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupAwardEditMutationVariables = Types.Exact<{
  awardId: Types.Scalars["Int"]["input"];
  awardName: Types.Scalars["String"]["input"];
  awardType: Types.Scalars["String"]["input"];
  awardValue: Types.Scalars["Float"]["input"];
  categoryId: Types.Scalars["Int"]["input"];
  description: Types.Scalars["String"]["input"];
  maxUsages: Types.Scalars["Int"]["input"];
  fileId: Types.Scalars["Int"]["input"];
}>;

export type SetupAwardEditMutation = {
  __typename?: "mutation_root";
  editAward?: { __typename?: "AwardType"; awardId: string } | null;
};

export const SetupAwardEditDocument = gql`
  mutation SetupAwardEdit(
    $awardId: Int!
    $awardName: String!
    $awardType: String!
    $awardValue: Float!
    $categoryId: Int!
    $description: String!
    $maxUsages: Int!
    $fileId: Int!
  ) {
    editAward(
      awardId: $awardId
      awardName: $awardName
      awardType: $awardType
      awardValue: $awardValue
      categoryId: $categoryId
      description: $description
      maxUsages: $maxUsages
      fileId: $fileId
    ) {
      awardId
    }
  }
`;
export type SetupAwardEditMutationFn = Apollo.MutationFunction<
  SetupAwardEditMutation,
  SetupAwardEditMutationVariables
>;

/**
 * __useSetupAwardEditMutation__
 *
 * To run a mutation, you first call `useSetupAwardEditMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupAwardEditMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupAwardEditMutation, { data, loading, error }] = useSetupAwardEditMutation({
 *   variables: {
 *      awardId: // value for 'awardId'
 *      awardName: // value for 'awardName'
 *      awardType: // value for 'awardType'
 *      awardValue: // value for 'awardValue'
 *      categoryId: // value for 'categoryId'
 *      description: // value for 'description'
 *      maxUsages: // value for 'maxUsages'
 *      fileId: // value for 'fileId'
 *   },
 * });
 */
export function useSetupAwardEditMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupAwardEditMutation,
    SetupAwardEditMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupAwardEditMutation,
    SetupAwardEditMutationVariables
  >(SetupAwardEditDocument, options);
}
export type SetupAwardEditMutationHookResult = ReturnType<
  typeof useSetupAwardEditMutation
>;
export type SetupAwardEditMutationResult =
  Apollo.MutationResult<SetupAwardEditMutation>;
export type SetupAwardEditMutationOptions = Apollo.BaseMutationOptions<
  SetupAwardEditMutation,
  SetupAwardEditMutationVariables
>;
