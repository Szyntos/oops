import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupChestEditMutationVariables = Types.Exact<{
  awardIds:
    | Array<Types.Scalars["Int"]["input"]>
    | Types.Scalars["Int"]["input"];
  chestId: Types.Scalars["Int"]["input"];
  awardBundleCount: Types.Scalars["Int"]["input"];
  fileId: Types.Scalars["Int"]["input"];
  chestType: Types.Scalars["String"]["input"];
}>;

export type SetupChestEditMutation = {
  __typename?: "mutation_root";
  editChest?: { __typename?: "ChestType"; chestId: string } | null;
};

export const SetupChestEditDocument = gql`
  mutation SetupChestEdit(
    $awardIds: [Int!]!
    $chestId: Int!
    $awardBundleCount: Int!
    $fileId: Int!
    $chestType: String!
  ) {
    editChest(
      awardIds: $awardIds
      chestId: $chestId
      awardBundleCount: $awardBundleCount
      fileId: $fileId
      chestType: $chestType
    ) {
      chestId
    }
  }
`;
export type SetupChestEditMutationFn = Apollo.MutationFunction<
  SetupChestEditMutation,
  SetupChestEditMutationVariables
>;

/**
 * __useSetupChestEditMutation__
 *
 * To run a mutation, you first call `useSetupChestEditMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupChestEditMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupChestEditMutation, { data, loading, error }] = useSetupChestEditMutation({
 *   variables: {
 *      awardIds: // value for 'awardIds'
 *      chestId: // value for 'chestId'
 *      awardBundleCount: // value for 'awardBundleCount'
 *      fileId: // value for 'fileId'
 *      chestType: // value for 'chestType'
 *   },
 * });
 */
export function useSetupChestEditMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupChestEditMutation,
    SetupChestEditMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupChestEditMutation,
    SetupChestEditMutationVariables
  >(SetupChestEditDocument, options);
}
export type SetupChestEditMutationHookResult = ReturnType<
  typeof useSetupChestEditMutation
>;
export type SetupChestEditMutationResult =
  Apollo.MutationResult<SetupChestEditMutation>;
export type SetupChestEditMutationOptions = Apollo.BaseMutationOptions<
  SetupChestEditMutation,
  SetupChestEditMutationVariables
>;
