import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type MakeStudentActiveMutationVariables = Types.Exact<{
  userId: Types.Scalars["Int"]["input"];
}>;

export type MakeStudentActiveMutation = {
  __typename?: "mutation_root";
  markStudentAsActive?: boolean | null;
};

export const MakeStudentActiveDocument = gql`
  mutation MakeStudentActive($userId: Int!) {
    markStudentAsActive(userId: $userId)
  }
`;
export type MakeStudentActiveMutationFn = Apollo.MutationFunction<
  MakeStudentActiveMutation,
  MakeStudentActiveMutationVariables
>;

/**
 * __useMakeStudentActiveMutation__
 *
 * To run a mutation, you first call `useMakeStudentActiveMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMakeStudentActiveMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [makeStudentActiveMutation, { data, loading, error }] = useMakeStudentActiveMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useMakeStudentActiveMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MakeStudentActiveMutation,
    MakeStudentActiveMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MakeStudentActiveMutation,
    MakeStudentActiveMutationVariables
  >(MakeStudentActiveDocument, options);
}
export type MakeStudentActiveMutationHookResult = ReturnType<
  typeof useMakeStudentActiveMutation
>;
export type MakeStudentActiveMutationResult =
  Apollo.MutationResult<MakeStudentActiveMutation>;
export type MakeStudentActiveMutationOptions = Apollo.BaseMutationOptions<
  MakeStudentActiveMutation,
  MakeStudentActiveMutationVariables
>;
