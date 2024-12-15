import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupStudentCreateMutationVariables = Types.Exact<{
  firstName: Types.Scalars["String"]["input"];
  secondName: Types.Scalars["String"]["input"];
  indexNumber: Types.Scalars["Int"]["input"];
  nick: Types.Scalars["String"]["input"];
}>;

export type SetupStudentCreateMutation = {
  __typename?: "mutation_root";
  addUser?: {
    __typename?: "UserType";
    userId: string;
    role: Types.UsersRolesType;
  } | null;
};

export const SetupStudentCreateDocument = gql`
  mutation SetupStudentCreate(
    $firstName: String!
    $secondName: String!
    $indexNumber: Int!
    $nick: String!
  ) {
    addUser(
      firstName: $firstName
      indexNumber: $indexNumber
      nick: $nick
      role: "student"
      secondName: $secondName
    ) {
      userId
      role
    }
  }
`;
export type SetupStudentCreateMutationFn = Apollo.MutationFunction<
  SetupStudentCreateMutation,
  SetupStudentCreateMutationVariables
>;

/**
 * __useSetupStudentCreateMutation__
 *
 * To run a mutation, you first call `useSetupStudentCreateMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupStudentCreateMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupStudentCreateMutation, { data, loading, error }] = useSetupStudentCreateMutation({
 *   variables: {
 *      firstName: // value for 'firstName'
 *      secondName: // value for 'secondName'
 *      indexNumber: // value for 'indexNumber'
 *      nick: // value for 'nick'
 *   },
 * });
 */
export function useSetupStudentCreateMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupStudentCreateMutation,
    SetupStudentCreateMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupStudentCreateMutation,
    SetupStudentCreateMutationVariables
  >(SetupStudentCreateDocument, options);
}
export type SetupStudentCreateMutationHookResult = ReturnType<
  typeof useSetupStudentCreateMutation
>;
export type SetupStudentCreateMutationResult =
  Apollo.MutationResult<SetupStudentCreateMutation>;
export type SetupStudentCreateMutationOptions = Apollo.BaseMutationOptions<
  SetupStudentCreateMutation,
  SetupStudentCreateMutationVariables
>;
