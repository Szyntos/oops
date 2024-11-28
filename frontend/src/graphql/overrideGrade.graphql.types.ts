import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type OverrideGradeMutationVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
  grade: Types.Scalars["Float"]["input"];
  userId: Types.Scalars["Int"]["input"];
}>;

export type OverrideGradeMutation = {
  __typename?: "mutation_root";
  overrideComputedGradeForUser?: {
    __typename?: "UserLevelType";
    computedGrade: number;
  } | null;
};

export const OverrideGradeDocument = gql`
  mutation OverrideGrade($editionId: Int!, $grade: Float!, $userId: Int!) {
    overrideComputedGradeForUser(
      editionId: $editionId
      grade: $grade
      userId: $userId
    ) {
      computedGrade
    }
  }
`;
export type OverrideGradeMutationFn = Apollo.MutationFunction<
  OverrideGradeMutation,
  OverrideGradeMutationVariables
>;

/**
 * __useOverrideGradeMutation__
 *
 * To run a mutation, you first call `useOverrideGradeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useOverrideGradeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [overrideGradeMutation, { data, loading, error }] = useOverrideGradeMutation({
 *   variables: {
 *      editionId: // value for 'editionId'
 *      grade: // value for 'grade'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useOverrideGradeMutation(
  baseOptions?: Apollo.MutationHookOptions<
    OverrideGradeMutation,
    OverrideGradeMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    OverrideGradeMutation,
    OverrideGradeMutationVariables
  >(OverrideGradeDocument, options);
}
export type OverrideGradeMutationHookResult = ReturnType<
  typeof useOverrideGradeMutation
>;
export type OverrideGradeMutationResult =
  Apollo.MutationResult<OverrideGradeMutation>;
export type OverrideGradeMutationOptions = Apollo.BaseMutationOptions<
  OverrideGradeMutation,
  OverrideGradeMutationVariables
>;
