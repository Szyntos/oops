import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupGroupEditMutationVariables = Types.Exact<{
  groupId: Types.Scalars["Int"]["input"];
  startTime: Types.Scalars["String"]["input"];
  endTime: Types.Scalars["String"]["input"];
  usosId: Types.Scalars["Int"]["input"];
  weekdayId: Types.Scalars["Int"]["input"];
  teacherId: Types.Scalars["Int"]["input"];
  userIds: Array<Types.Scalars["Int"]["input"]> | Types.Scalars["Int"]["input"];
}>;

export type SetupGroupEditMutation = {
  __typename?: "mutation_root";
  editGroupWithUsers?: { __typename?: "GroupType"; groupsId: string } | null;
};

export const SetupGroupEditDocument = gql`
  mutation SetupGroupEdit(
    $groupId: Int!
    $startTime: String!
    $endTime: String!
    $usosId: Int!
    $weekdayId: Int!
    $teacherId: Int!
    $userIds: [Int!]!
  ) {
    editGroupWithUsers(
      groupId: $groupId
      endTime: $endTime
      startTime: $startTime
      teacherId: $teacherId
      usosId: $usosId
      weekdayId: $weekdayId
      users: { userIds: $userIds }
    ) {
      groupsId
    }
  }
`;
export type SetupGroupEditMutationFn = Apollo.MutationFunction<
  SetupGroupEditMutation,
  SetupGroupEditMutationVariables
>;

/**
 * __useSetupGroupEditMutation__
 *
 * To run a mutation, you first call `useSetupGroupEditMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupGroupEditMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupGroupEditMutation, { data, loading, error }] = useSetupGroupEditMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      startTime: // value for 'startTime'
 *      endTime: // value for 'endTime'
 *      usosId: // value for 'usosId'
 *      weekdayId: // value for 'weekdayId'
 *      teacherId: // value for 'teacherId'
 *      userIds: // value for 'userIds'
 *   },
 * });
 */
export function useSetupGroupEditMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupGroupEditMutation,
    SetupGroupEditMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupGroupEditMutation,
    SetupGroupEditMutationVariables
  >(SetupGroupEditDocument, options);
}
export type SetupGroupEditMutationHookResult = ReturnType<
  typeof useSetupGroupEditMutation
>;
export type SetupGroupEditMutationResult =
  Apollo.MutationResult<SetupGroupEditMutation>;
export type SetupGroupEditMutationOptions = Apollo.BaseMutationOptions<
  SetupGroupEditMutation,
  SetupGroupEditMutationVariables
>;
