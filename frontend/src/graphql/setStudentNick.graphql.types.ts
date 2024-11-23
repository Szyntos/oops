import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetStudentNickMutationVariables = Types.Exact<{
  nick: Types.Scalars["String"]["input"];
  userId: Types.Scalars["Int"]["input"];
}>;

export type SetStudentNickMutation = {
  __typename?: "mutation_root";
  setStudentNick?: {
    __typename?: "UserType";
    nickSetByUser: boolean;
    nick: string;
    indexNumber: number;
  } | null;
};

export const SetStudentNickDocument = gql`
  mutation SetStudentNick($nick: String!, $userId: Int!) {
    setStudentNick(nick: $nick, userId: $userId) {
      nickSetByUser
      nick
      indexNumber
    }
  }
`;
export type SetStudentNickMutationFn = Apollo.MutationFunction<
  SetStudentNickMutation,
  SetStudentNickMutationVariables
>;

/**
 * __useSetStudentNickMutation__
 *
 * To run a mutation, you first call `useSetStudentNickMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetStudentNickMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setStudentNickMutation, { data, loading, error }] = useSetStudentNickMutation({
 *   variables: {
 *      nick: // value for 'nick'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useSetStudentNickMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetStudentNickMutation,
    SetStudentNickMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetStudentNickMutation,
    SetStudentNickMutationVariables
  >(SetStudentNickDocument, options);
}
export type SetStudentNickMutationHookResult = ReturnType<
  typeof useSetStudentNickMutation
>;
export type SetStudentNickMutationResult =
  Apollo.MutationResult<SetStudentNickMutation>;
export type SetStudentNickMutationOptions = Apollo.BaseMutationOptions<
  SetStudentNickMutation,
  SetStudentNickMutationVariables
>;
