import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupChestCreateMutationVariables = Types.Exact<{
  awardIds:
    | Array<Types.Scalars["Int"]["input"]>
    | Types.Scalars["Int"]["input"];
  awardBundleCount: Types.Scalars["Int"]["input"];
  fileId: Types.Scalars["Int"]["input"];
  chestType: Types.Scalars["String"]["input"];
}>;

export type SetupChestCreateMutation = {
  __typename?: "mutation_root";
  addChest?: { __typename?: "ChestType"; chestId: string } | null;
};

export const SetupChestCreateDocument = gql`
  mutation SetupChestCreate(
    $awardIds: [Int!]!
    $awardBundleCount: Int!
    $fileId: Int!
    $chestType: String!
  ) {
    addChest(
      awardIds: $awardIds
      awardBundleCount: $awardBundleCount
      fileId: $fileId
      chestType: $chestType
    ) {
      chestId
    }
  }
`;
export type SetupChestCreateMutationFn = Apollo.MutationFunction<
  SetupChestCreateMutation,
  SetupChestCreateMutationVariables
>;

/**
 * __useSetupChestCreateMutation__
 *
 * To run a mutation, you first call `useSetupChestCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupChestCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupChestCreateMutation, { data, loading, error }] = useSetupChestCreateMutation({
 *   variables: {
 *      awardIds: // value for 'awardIds'
 *      awardBundleCount: // value for 'awardBundleCount'
 *      fileId: // value for 'fileId'
 *      chestType: // value for 'chestType'
 *   },
 * });
 */
export function useSetupChestCreateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupChestCreateMutation,
    SetupChestCreateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupChestCreateMutation,
    SetupChestCreateMutationVariables
  >(SetupChestCreateDocument, options);
}
export type SetupChestCreateMutationHookResult = ReturnType<
  typeof useSetupChestCreateMutation
>;
export type SetupChestCreateMutationResult =
  Apollo.MutationResult<SetupChestCreateMutation>;
export type SetupChestCreateMutationOptions = Apollo.BaseMutationOptions<
  SetupChestCreateMutation,
  SetupChestCreateMutationVariables
>;
