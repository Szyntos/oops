import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SEtupUserEditMutationVariables = Types.Exact<{
  userId: Types.Scalars["Int"]["input"];
  secondName: Types.Scalars["String"]["input"];
  nick?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  indexNumber?: Types.InputMaybe<Types.Scalars["Int"]["input"]>;
  firstName: Types.Scalars["String"]["input"];
}>;

export type SEtupUserEditMutation = {
  __typename?: "mutation_root";
  editUser?: {
    __typename?: "UserType";
    email: string;
    firebaseUid?: string | null;
    firstName: string;
    indexNumber: number;
    label: string;
    nick: string;
    role: Types.UsersRolesType;
    secondName: string;
    userId: string;
  } | null;
};

export const SEtupUserEditDocument = gql`
  mutation SEtupUserEdit(
    $userId: Int!
    $secondName: String!
    $nick: String
    $indexNumber: Int
    $firstName: String!
  ) {
    editUser(
      userId: $userId
      secondName: $secondName
      nick: $nick
      indexNumber: $indexNumber
      firstName: $firstName
    ) {
      email
      firebaseUid
      firstName
      indexNumber
      label
      nick
      role
      secondName
      userId
    }
  }
`;
export type SEtupUserEditMutationFn = Apollo.MutationFunction<
  SEtupUserEditMutation,
  SEtupUserEditMutationVariables
>;

/**
 * __useSEtupUserEditMutation__
 *
 * To run a mutation, you first call `useSEtupUserEditMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSEtupUserEditMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sEtupUserEditMutation, { data, loading, error }] = useSEtupUserEditMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      secondName: // value for 'secondName'
 *      nick: // value for 'nick'
 *      indexNumber: // value for 'indexNumber'
 *      firstName: // value for 'firstName'
 *   },
 * });
 */
export function useSEtupUserEditMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SEtupUserEditMutation,
    SEtupUserEditMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SEtupUserEditMutation,
    SEtupUserEditMutationVariables
  >(SEtupUserEditDocument, options);
}
export type SEtupUserEditMutationHookResult = ReturnType<
  typeof useSEtupUserEditMutation
>;
export type SEtupUserEditMutationResult =
  Apollo.MutationResult<SEtupUserEditMutation>;
export type SEtupUserEditMutationOptions = Apollo.BaseMutationOptions<
  SEtupUserEditMutation,
  SEtupUserEditMutationVariables
>;
