import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupAwardEditionAddMutationVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
  awardId: Types.Scalars["Int"]["input"];
}>;

export type SetupAwardEditionAddMutation = {
  __typename?: "mutation_root";
  addAwardToEdition?: {
    __typename?: "AwardEditionType";
    award: { __typename?: "AwardType"; awardId: string };
  } | null;
};

export const SetupAwardEditionAddDocument = gql`
  mutation SetupAwardEditionAdd($editionId: Int!, $awardId: Int!) {
    addAwardToEdition(editionId: $editionId, awardId: $awardId) {
      award {
        awardId
      }
    }
  }
`;
export type SetupAwardEditionAddMutationFn = Apollo.MutationFunction<
  SetupAwardEditionAddMutation,
  SetupAwardEditionAddMutationVariables
>;

/**
 * __useSetupAwardEditionAddMutation__
 *
 * To run a mutation, you first call `useSetupAwardEditionAddMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupAwardEditionAddMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupAwardEditionAddMutation, { data, loading, error }] = useSetupAwardEditionAddMutation({
 *   variables: {
 *      editionId: // value for 'editionId'
 *      awardId: // value for 'awardId'
 *   },
 * });
 */
export function useSetupAwardEditionAddMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupAwardEditionAddMutation,
    SetupAwardEditionAddMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupAwardEditionAddMutation,
    SetupAwardEditionAddMutationVariables
  >(SetupAwardEditionAddDocument, options);
}
export type SetupAwardEditionAddMutationHookResult = ReturnType<
  typeof useSetupAwardEditionAddMutation
>;
export type SetupAwardEditionAddMutationResult =
  Apollo.MutationResult<SetupAwardEditionAddMutation>;
export type SetupAwardEditionAddMutationOptions = Apollo.BaseMutationOptions<
  SetupAwardEditionAddMutation,
  SetupAwardEditionAddMutationVariables
>;
