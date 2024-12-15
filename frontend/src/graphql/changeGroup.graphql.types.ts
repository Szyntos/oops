import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type ChangeGroupMutationVariables = Types.Exact<{
  groupId: Types.Scalars["Int"]["input"];
  userId: Types.Scalars["Int"]["input"];
}>;

export type ChangeGroupMutation = {
  __typename?: "mutation_root";
  changeStudentGroup?: {
    __typename?: "UserGroupType";
    userGroupsId: string;
  } | null;
};

export const ChangeGroupDocument = gql`
  mutation ChangeGroup($groupId: Int!, $userId: Int!) {
    changeStudentGroup(groupId: $groupId, userId: $userId) {
      userGroupsId
    }
  }
`;
export type ChangeGroupMutationFn = Apollo.MutationFunction<
  ChangeGroupMutation,
  ChangeGroupMutationVariables
>;

/**
 * __useChangeGroupMutation__
 *
 * To run a mutation, you first call `useChangeGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangeGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changeGroupMutation, { data, loading, error }] = useChangeGroupMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useChangeGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ChangeGroupMutation,
    ChangeGroupMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ChangeGroupMutation, ChangeGroupMutationVariables>(
    ChangeGroupDocument,
    options,
  );
}
export type ChangeGroupMutationHookResult = ReturnType<
  typeof useChangeGroupMutation
>;
export type ChangeGroupMutationResult =
  Apollo.MutationResult<ChangeGroupMutation>;
export type ChangeGroupMutationOptions = Apollo.BaseMutationOptions<
  ChangeGroupMutation,
  ChangeGroupMutationVariables
>;
