import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupGradingChecksAddMutationVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
  endOfLabsDate: Types.Scalars["String"]["input"];
  endOfLabsLevelsThreshold: Types.Scalars["Int"]["input"];
  projectId: Types.Scalars["Int"]["input"];
  projectPointsThreshold: Types.Scalars["Float"]["input"];
}>;

export type SetupGradingChecksAddMutation = {
  __typename?: "mutation_root";
  addGradingCheck?: {
    __typename?: "GradingChecksType";
    endOfLabsDate: string;
    gradingCheckId: string;
    projectPointsThreshold: number;
    edition: { __typename?: "EditionType"; editionId: string };
    endOfLabsLevelsThreshold: { __typename?: "LevelType"; levelId: string };
    project: { __typename?: "CategoryType"; categoryId: string };
  } | null;
};

export const SetupGradingChecksAddDocument = gql`
  mutation SetupGradingChecksAdd(
    $editionId: Int!
    $endOfLabsDate: String!
    $endOfLabsLevelsThreshold: Int!
    $projectId: Int!
    $projectPointsThreshold: Float!
  ) {
    addGradingCheck(
      editionId: $editionId
      endOfLabsDate: $endOfLabsDate
      endOfLabsLevelsThreshold: $endOfLabsLevelsThreshold
      projectId: $projectId
      projectPointsThreshold: $projectPointsThreshold
    ) {
      endOfLabsDate
      gradingCheckId
      projectPointsThreshold
      edition {
        editionId
      }
      endOfLabsLevelsThreshold {
        levelId
      }
      project {
        categoryId
      }
    }
  }
`;
export type SetupGradingChecksAddMutationFn = Apollo.MutationFunction<
  SetupGradingChecksAddMutation,
  SetupGradingChecksAddMutationVariables
>;

/**
 * __useSetupGradingChecksAddMutation__
 *
 * To run a mutation, you first call `useSetupGradingChecksAddMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupGradingChecksAddMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupGradingChecksAddMutation, { data, loading, error }] = useSetupGradingChecksAddMutation({
 *   variables: {
 *      editionId: // value for 'editionId'
 *      endOfLabsDate: // value for 'endOfLabsDate'
 *      endOfLabsLevelsThreshold: // value for 'endOfLabsLevelsThreshold'
 *      projectId: // value for 'projectId'
 *      projectPointsThreshold: // value for 'projectPointsThreshold'
 *   },
 * });
 */
export function useSetupGradingChecksAddMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupGradingChecksAddMutation,
    SetupGradingChecksAddMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupGradingChecksAddMutation,
    SetupGradingChecksAddMutationVariables
  >(SetupGradingChecksAddDocument, options);
}
export type SetupGradingChecksAddMutationHookResult = ReturnType<
  typeof useSetupGradingChecksAddMutation
>;
export type SetupGradingChecksAddMutationResult =
  Apollo.MutationResult<SetupGradingChecksAddMutation>;
export type SetupGradingChecksAddMutationOptions = Apollo.BaseMutationOptions<
  SetupGradingChecksAddMutation,
  SetupGradingChecksAddMutationVariables
>;
