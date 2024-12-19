import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetStudentAvatarMutationVariables = Types.Exact<{
  userId: Types.Scalars["Int"]["input"];
  fileId: Types.Scalars["Int"]["input"];
}>;

export type SetStudentAvatarMutation = {
  __typename?: "mutation_root";
  assignPhotoToUser?: boolean | null;
};

export const SetStudentAvatarDocument = gql`
  mutation SetStudentAvatar($userId: Int!, $fileId: Int!) {
    assignPhotoToUser(userId: $userId, fileId: $fileId)
  }
`;
export type SetStudentAvatarMutationFn = Apollo.MutationFunction<
  SetStudentAvatarMutation,
  SetStudentAvatarMutationVariables
>;

/**
 * __useSetStudentAvatarMutation__
 *
 * To run a mutation, you first call `useSetStudentAvatarMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetStudentAvatarMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setStudentAvatarMutation, { data, loading, error }] = useSetStudentAvatarMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      fileId: // value for 'fileId'
 *   },
 * });
 */
export function useSetStudentAvatarMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetStudentAvatarMutation,
    SetStudentAvatarMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetStudentAvatarMutation,
    SetStudentAvatarMutationVariables
  >(SetStudentAvatarDocument, options);
}
export type SetStudentAvatarMutationHookResult = ReturnType<
  typeof useSetStudentAvatarMutation
>;
export type SetStudentAvatarMutationResult =
  Apollo.MutationResult<SetStudentAvatarMutation>;
export type SetStudentAvatarMutationOptions = Apollo.BaseMutationOptions<
  SetStudentAvatarMutation,
  SetStudentAvatarMutationVariables
>;
