import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupGradingChecksEditMutationVariables = Types.Exact<{
  gradingCheckId: Types.Scalars["Int"]["input"];
  endOfLabsDate?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  endOfLabsLevelsThreshold: Types.Scalars["Int"]["input"];
  projectId: Types.Scalars["Int"]["input"];
  projectPointsThreshold: Types.Scalars["Float"]["input"];
}>;

export type SetupGradingChecksEditMutation = {
  __typename?: "mutation_root";
  editGradingCheck?: {
    __typename?: "GradingChecksType";
    endOfLabsDate: string;
    gradingCheckId: string;
    projectPointsThreshold: number;
    edition: { __typename?: "EditionType"; editionId: string };
    endOfLabsLevelsThreshold: { __typename?: "LevelType"; levelId: string };
    project: { __typename?: "CategoryType"; categoryId: string };
  } | null;
};

export const SetupGradingChecksEditDocument = gql`
  mutation SetupGradingChecksEdit(
    $gradingCheckId: Int!
    $endOfLabsDate: String
    $endOfLabsLevelsThreshold: Int!
    $projectId: Int!
    $projectPointsThreshold: Float!
  ) {
    editGradingCheck(
      gradingCheckId: $gradingCheckId
      endOfLabsDate: $endOfLabsDate
      endOfLabsLevelsThreshold: $endOfLabsLevelsThreshold
      projectId: $projectId
      projectPointsThreshold: $projectPointsThreshold
    ) {
      edition {
        editionId
      }
      endOfLabsDate
      endOfLabsLevelsThreshold {
        levelId
      }
      gradingCheckId
      project {
        categoryId
      }
      projectPointsThreshold
    }
  }
`;
export type SetupGradingChecksEditMutationFn = Apollo.MutationFunction<
  SetupGradingChecksEditMutation,
  SetupGradingChecksEditMutationVariables
>;

/**
 * __useSetupGradingChecksEditMutation__
 *
 * To run a mutation, you first call `useSetupGradingChecksEditMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupGradingChecksEditMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupGradingChecksEditMutation, { data, loading, error }] = useSetupGradingChecksEditMutation({
 *   variables: {
 *      gradingCheckId: // value for 'gradingCheckId'
 *      endOfLabsDate: // value for 'endOfLabsDate'
 *      endOfLabsLevelsThreshold: // value for 'endOfLabsLevelsThreshold'
 *      projectId: // value for 'projectId'
 *      projectPointsThreshold: // value for 'projectPointsThreshold'
 *   },
 * });
 */
export function useSetupGradingChecksEditMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupGradingChecksEditMutation,
    SetupGradingChecksEditMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupGradingChecksEditMutation,
    SetupGradingChecksEditMutationVariables
  >(SetupGradingChecksEditDocument, options);
}
export type SetupGradingChecksEditMutationHookResult = ReturnType<
  typeof useSetupGradingChecksEditMutation
>;
export type SetupGradingChecksEditMutationResult =
  Apollo.MutationResult<SetupGradingChecksEditMutation>;
export type SetupGradingChecksEditMutationOptions = Apollo.BaseMutationOptions<
  SetupGradingChecksEditMutation,
  SetupGradingChecksEditMutationVariables
>;
