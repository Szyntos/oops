import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type RegenerateGradeMutationVariables = Types.Exact<{
  userId: Types.Scalars["Int"]["input"];
  editionId: Types.Scalars["Int"]["input"];
}>;

export type RegenerateGradeMutation = {
  __typename?: "mutation_root";
  turnOffOverrideComputedGradeForUser?: {
    __typename?: "UserLevelType";
    user: { __typename?: "UserType"; userId: string };
  } | null;
};

export const RegenerateGradeDocument = gql`
  mutation RegenerateGrade($userId: Int!, $editionId: Int!) {
    turnOffOverrideComputedGradeForUser(
      userId: $userId
      editionId: $editionId
    ) {
      user {
        userId
      }
    }
  }
`;
export type RegenerateGradeMutationFn = Apollo.MutationFunction<
  RegenerateGradeMutation,
  RegenerateGradeMutationVariables
>;

/**
 * __useRegenerateGradeMutation__
 *
 * To run a mutation, you first call `useRegenerateGradeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegenerateGradeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [regenerateGradeMutation, { data, loading, error }] = useRegenerateGradeMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useRegenerateGradeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RegenerateGradeMutation,
    RegenerateGradeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    RegenerateGradeMutation,
    RegenerateGradeMutationVariables
  >(RegenerateGradeDocument, options);
}
export type RegenerateGradeMutationHookResult = ReturnType<
  typeof useRegenerateGradeMutation
>;
export type RegenerateGradeMutationResult =
  Apollo.MutationResult<RegenerateGradeMutation>;
export type RegenerateGradeMutationOptions = Apollo.BaseMutationOptions<
  RegenerateGradeMutation,
  RegenerateGradeMutationVariables
>;
