import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type AddPointsToGroupMutationVariables = Types.Exact<{
  groupId: Types.Scalars["Int"]["input"];
  subcategoryId: Types.Scalars["Int"]["input"];
  teacherId: Types.Scalars["Int"]["input"];
  values: Array<Types.GroupPointsInputType> | Types.GroupPointsInputType;
}>;

export type AddPointsToGroupMutation = {
  __typename?: "mutation_root";
  addPointsToGroup: Array<{
    __typename?: "GroupPointsType";
    points?: { __typename?: "PointType"; pointsId: string } | null;
  }>;
};

export const AddPointsToGroupDocument = gql`
  mutation AddPointsToGroup(
    $groupId: Int!
    $subcategoryId: Int!
    $teacherId: Int!
    $values: [GroupPointsInputType!]!
  ) {
    addPointsToGroup(
      groupId: $groupId
      subcategoryId: $subcategoryId
      teacherId: $teacherId
      values: $values
    ) {
      points {
        pointsId
      }
    }
  }
`;
export type AddPointsToGroupMutationFn = Apollo.MutationFunction<
  AddPointsToGroupMutation,
  AddPointsToGroupMutationVariables
>;

/**
 * __useAddPointsToGroupMutation__
 *
 * To run a mutation, you first call `useAddPointsToGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddPointsToGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addPointsToGroupMutation, { data, loading, error }] = useAddPointsToGroupMutation({
 *   variables: {
 *      groupId: // value for 'groupId'
 *      subcategoryId: // value for 'subcategoryId'
 *      teacherId: // value for 'teacherId'
 *      values: // value for 'values'
 *   },
 * });
 */
export function useAddPointsToGroupMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddPointsToGroupMutation,
    AddPointsToGroupMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AddPointsToGroupMutation,
    AddPointsToGroupMutationVariables
  >(AddPointsToGroupDocument, options);
}
export type AddPointsToGroupMutationHookResult = ReturnType<
  typeof useAddPointsToGroupMutation
>;
export type AddPointsToGroupMutationResult =
  Apollo.MutationResult<AddPointsToGroupMutation>;
export type AddPointsToGroupMutationOptions = Apollo.BaseMutationOptions<
  AddPointsToGroupMutation,
  AddPointsToGroupMutationVariables
>;
