import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type ResetPasswordByEmailMutationVariables = Types.Exact<{
  email: Types.Scalars["String"]["input"];
}>;

export type ResetPasswordByEmailMutation = {
  __typename?: "mutation_root";
  resetPasswordByEmail?: boolean | null;
};

export const ResetPasswordByEmailDocument = gql`
  mutation resetPasswordByEmail($email: String!) {
    resetPasswordByEmail(email: $email)
  }
`;
export type ResetPasswordByEmailMutationFn = Apollo.MutationFunction<
  ResetPasswordByEmailMutation,
  ResetPasswordByEmailMutationVariables
>;

/**
 * __useResetPasswordByEmailMutation__
 *
 * To run a mutation, you first call `useResetPasswordByEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordByEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordByEmailMutation, { data, loading, error }] = useResetPasswordByEmailMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useResetPasswordByEmailMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ResetPasswordByEmailMutation,
    ResetPasswordByEmailMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ResetPasswordByEmailMutation,
    ResetPasswordByEmailMutationVariables
  >(ResetPasswordByEmailDocument, options);
}
export type ResetPasswordByEmailMutationHookResult = ReturnType<
  typeof useResetPasswordByEmailMutation
>;
export type ResetPasswordByEmailMutationResult =
  Apollo.MutationResult<ResetPasswordByEmailMutation>;
export type ResetPasswordByEmailMutationOptions = Apollo.BaseMutationOptions<
  ResetPasswordByEmailMutation,
  ResetPasswordByEmailMutationVariables
>;
