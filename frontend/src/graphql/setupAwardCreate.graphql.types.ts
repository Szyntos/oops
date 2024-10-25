import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupAwardCreateMutationVariables = Types.Exact<{
  awardName: Types.Scalars["String"]["input"];
  awardType: Types.Scalars["String"]["input"];
  awardValue: Types.Scalars["Float"]["input"];
  categoryId: Types.Scalars["Int"]["input"];
  description: Types.Scalars["String"]["input"];
  maxUsages: Types.Scalars["Int"]["input"];
  label: Types.Scalars["String"]["input"];
  fileId: Types.Scalars["Int"]["input"];
}>;

export type SetupAwardCreateMutation = {
  __typename?: "mutation_root";
  addAward?: {
    __typename?: "AwardType";
    awardId: string;
    awardName: string;
    awardType: Types.AwardTypeType;
    awardValue: string;
    description: string;
    label: string;
    maxUsages: number;
    imageFile?: { __typename?: "FileType"; fileId: string } | null;
  } | null;
};

export const SetupAwardCreateDocument = gql`
  mutation SetupAwardCreate(
    $awardName: String!
    $awardType: String!
    $awardValue: Float!
    $categoryId: Int!
    $description: String!
    $maxUsages: Int!
    $label: String!
    $fileId: Int!
  ) {
    addAward(
      awardName: $awardName
      awardType: $awardType
      awardValue: $awardValue
      categoryId: $categoryId
      description: $description
      maxUsages: $maxUsages
      label: $label
      fileId: $fileId
    ) {
      awardId
      awardName
      awardType
      awardValue
      description
      label
      maxUsages
      imageFile {
        fileId
      }
    }
  }
`;
export type SetupAwardCreateMutationFn = Apollo.MutationFunction<
  SetupAwardCreateMutation,
  SetupAwardCreateMutationVariables
>;

/**
 * __useSetupAwardCreateMutation__
 *
 * To run a mutation, you first call `useSetupAwardCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupAwardCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupAwardCreateMutation, { data, loading, error }] = useSetupAwardCreateMutation({
 *   variables: {
 *      awardName: // value for 'awardName'
 *      awardType: // value for 'awardType'
 *      awardValue: // value for 'awardValue'
 *      categoryId: // value for 'categoryId'
 *      description: // value for 'description'
 *      maxUsages: // value for 'maxUsages'
 *      label: // value for 'label'
 *      fileId: // value for 'fileId'
 *   },
 * });
 */
export function useSetupAwardCreateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupAwardCreateMutation,
    SetupAwardCreateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupAwardCreateMutation,
    SetupAwardCreateMutationVariables
  >(SetupAwardCreateDocument, options);
}
export type SetupAwardCreateMutationHookResult = ReturnType<
  typeof useSetupAwardCreateMutation
>;
export type SetupAwardCreateMutationResult =
  Apollo.MutationResult<SetupAwardCreateMutation>;
export type SetupAwardCreateMutationOptions = Apollo.BaseMutationOptions<
  SetupAwardCreateMutation,
  SetupAwardCreateMutationVariables
>;
