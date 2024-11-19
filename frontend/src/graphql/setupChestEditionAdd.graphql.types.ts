import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupChestEditionAddMutationVariables = Types.Exact<{
  chestId: Types.Scalars["Int"]["input"];
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupChestEditionAddMutation = {
  __typename?: "mutation_root";
  addChestToEdition?: {
    __typename?: "ChestEditionType";
    chest: { __typename?: "ChestType"; chestId: string };
  } | null;
};

export const SetupChestEditionAddDocument = gql`
  mutation SetupChestEditionAdd($chestId: Int!, $editionId: Int!) {
    addChestToEdition(chestId: $chestId, editionId: $editionId) {
      chest {
        chestId
      }
    }
  }
`;
export type SetupChestEditionAddMutationFn = Apollo.MutationFunction<
  SetupChestEditionAddMutation,
  SetupChestEditionAddMutationVariables
>;

/**
 * __useSetupChestEditionAddMutation__
 *
 * To run a mutation, you first call `useSetupChestEditionAddMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupChestEditionAddMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupChestEditionAddMutation, { data, loading, error }] = useSetupChestEditionAddMutation({
 *   variables: {
 *      chestId: // value for 'chestId'
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupChestEditionAddMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupChestEditionAddMutation,
    SetupChestEditionAddMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupChestEditionAddMutation,
    SetupChestEditionAddMutationVariables
  >(SetupChestEditionAddDocument, options);
}
export type SetupChestEditionAddMutationHookResult = ReturnType<
  typeof useSetupChestEditionAddMutation
>;
export type SetupChestEditionAddMutationResult =
  Apollo.MutationResult<SetupChestEditionAddMutation>;
export type SetupChestEditionAddMutationOptions = Apollo.BaseMutationOptions<
  SetupChestEditionAddMutation,
  SetupChestEditionAddMutationVariables
>;
