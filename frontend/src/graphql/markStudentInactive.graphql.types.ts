import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type MakeStudentInactiveMutationVariables = Types.Exact<{
  userId: Types.Scalars["Int"]["input"];
}>;

export type MakeStudentInactiveMutation = {
  __typename?: "mutation_root";
  markStudentAsInactive?: boolean | null;
};

export const MakeStudentInactiveDocument = gql`
  mutation MakeStudentInactive($userId: Int!) {
    markStudentAsInactive(userId: $userId)
  }
`;
export type MakeStudentInactiveMutationFn = Apollo.MutationFunction<
  MakeStudentInactiveMutation,
  MakeStudentInactiveMutationVariables
>;

/**
 * __useMakeStudentInactiveMutation__
 *
 * To run a mutation, you first call `useMakeStudentInactiveMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMakeStudentInactiveMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [makeStudentInactiveMutation, { data, loading, error }] = useMakeStudentInactiveMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useMakeStudentInactiveMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MakeStudentInactiveMutation,
    MakeStudentInactiveMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MakeStudentInactiveMutation,
    MakeStudentInactiveMutationVariables
  >(MakeStudentInactiveDocument, options);
}
export type MakeStudentInactiveMutationHookResult = ReturnType<
  typeof useMakeStudentInactiveMutation
>;
export type MakeStudentInactiveMutationResult =
  Apollo.MutationResult<MakeStudentInactiveMutation>;
export type MakeStudentInactiveMutationOptions = Apollo.BaseMutationOptions<
  MakeStudentInactiveMutation,
  MakeStudentInactiveMutationVariables
>;
