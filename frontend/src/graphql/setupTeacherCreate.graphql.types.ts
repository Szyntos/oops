import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupTeacherCreateMutationVariables = Types.Exact<{
  firstName: Types.Scalars["String"]["input"];
  secondName: Types.Scalars["String"]["input"];
  email: Types.Scalars["String"]["input"];
}>;

export type SetupTeacherCreateMutation = {
  __typename?: "mutation_root";
  addTeacher?: {
    __typename?: "UserType";
    email: string;
    firstName: string;
  } | null;
};

export const SetupTeacherCreateDocument = gql`
  mutation SetupTeacherCreate(
    $firstName: String!
    $secondName: String!
    $email: String!
  ) {
    addTeacher(
      firstName: $firstName
      secondName: $secondName
      email: $email
      label: ""
      createFirebaseUser: false
      sendEmail: false
    ) {
      email
      firstName
    }
  }
`;
export type SetupTeacherCreateMutationFn = Apollo.MutationFunction<
  SetupTeacherCreateMutation,
  SetupTeacherCreateMutationVariables
>;

/**
 * __useSetupTeacherCreateMutation__
 *
 * To run a mutation, you first call `useSetupTeacherCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupTeacherCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupTeacherCreateMutation, { data, loading, error }] = useSetupTeacherCreateMutation({
 *   variables: {
 *      firstName: // value for 'firstName'
 *      secondName: // value for 'secondName'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useSetupTeacherCreateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupTeacherCreateMutation,
    SetupTeacherCreateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupTeacherCreateMutation,
    SetupTeacherCreateMutationVariables
  >(SetupTeacherCreateDocument, options);
}
export type SetupTeacherCreateMutationHookResult = ReturnType<
  typeof useSetupTeacherCreateMutation
>;
export type SetupTeacherCreateMutationResult =
  Apollo.MutationResult<SetupTeacherCreateMutation>;
export type SetupTeacherCreateMutationOptions = Apollo.BaseMutationOptions<
  SetupTeacherCreateMutation,
  SetupTeacherCreateMutationVariables
>;
