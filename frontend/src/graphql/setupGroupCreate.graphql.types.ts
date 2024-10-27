import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupGroupCreateMutationVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
  startTime: Types.Scalars["String"]["input"];
  endTime: Types.Scalars["String"]["input"];
  teacherId: Types.Scalars["Int"]["input"];
  usosId: Types.Scalars["Int"]["input"];
  weekdayId: Types.Scalars["Int"]["input"];
}>;

export type SetupGroupCreateMutation = {
  __typename?: "mutation_root";
  addGroup?: { __typename?: "GroupType"; usosId: number } | null;
};

export const SetupGroupCreateDocument = gql`
  mutation SetupGroupCreate(
    $editionId: Int!
    $startTime: String!
    $endTime: String!
    $teacherId: Int!
    $usosId: Int!
    $weekdayId: Int!
  ) {
    addGroup(
      editionId: $editionId
      endTime: $endTime
      startTime: $startTime
      teacherId: $teacherId
      usosId: $usosId
      weekdayId: $weekdayId
    ) {
      usosId
    }
  }
`;
export type SetupGroupCreateMutationFn = Apollo.MutationFunction<
  SetupGroupCreateMutation,
  SetupGroupCreateMutationVariables
>;

/**
 * __useSetupGroupCreateMutation__
 *
 * To run a mutation, you first call `useSetupGroupCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupGroupCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupGroupCreateMutation, { data, loading, error }] = useSetupGroupCreateMutation({
 *   variables: {
 *      editionId: // value for 'editionId'
 *      startTime: // value for 'startTime'
 *      endTime: // value for 'endTime'
 *      teacherId: // value for 'teacherId'
 *      usosId: // value for 'usosId'
 *      weekdayId: // value for 'weekdayId'
 *   },
 * });
 */
export function useSetupGroupCreateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupGroupCreateMutation,
    SetupGroupCreateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupGroupCreateMutation,
    SetupGroupCreateMutationVariables
  >(SetupGroupCreateDocument, options);
}
export type SetupGroupCreateMutationHookResult = ReturnType<
  typeof useSetupGroupCreateMutation
>;
export type SetupGroupCreateMutationResult =
  Apollo.MutationResult<SetupGroupCreateMutation>;
export type SetupGroupCreateMutationOptions = Apollo.BaseMutationOptions<
  SetupGroupCreateMutation,
  SetupGroupCreateMutationVariables
>;
