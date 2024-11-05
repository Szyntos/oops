import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupLevelSetEditionAddMutationVariables = Types.Exact<{
  levelSetId: Types.Scalars["Int"]["input"];
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupLevelSetEditionAddMutation = {
  __typename?: "mutation_root";
  addLevelSetToEdition: {
    __typename?: "LevelSetType";
    levelSetId: string;
    levelSetName: string;
  };
};

export const SetupLevelSetEditionAddDocument = gql`
  mutation SetupLevelSetEditionAdd($levelSetId: Int!, $editionId: Int!) {
    addLevelSetToEdition(levelSetID: $levelSetId, editionId: $editionId) {
      levelSetId
      levelSetName
    }
  }
`;
export type SetupLevelSetEditionAddMutationFn = Apollo.MutationFunction<
  SetupLevelSetEditionAddMutation,
  SetupLevelSetEditionAddMutationVariables
>;

/**
 * __useSetupLevelSetEditionAddMutation__
 *
 * To run a mutation, you first call `useSetupLevelSetEditionAddMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupLevelSetEditionAddMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupLevelSetEditionAddMutation, { data, loading, error }] = useSetupLevelSetEditionAddMutation({
 *   variables: {
 *      levelSetId: // value for 'levelSetId'
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupLevelSetEditionAddMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupLevelSetEditionAddMutation,
    SetupLevelSetEditionAddMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupLevelSetEditionAddMutation,
    SetupLevelSetEditionAddMutationVariables
  >(SetupLevelSetEditionAddDocument, options);
}
export type SetupLevelSetEditionAddMutationHookResult = ReturnType<
  typeof useSetupLevelSetEditionAddMutation
>;
export type SetupLevelSetEditionAddMutationResult =
  Apollo.MutationResult<SetupLevelSetEditionAddMutation>;
export type SetupLevelSetEditionAddMutationOptions = Apollo.BaseMutationOptions<
  SetupLevelSetEditionAddMutation,
  SetupLevelSetEditionAddMutationVariables
>;
