import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type AddChestToUserMutationVariables = Types.Exact<{
  chestId: Types.Scalars["Int"]["input"];
  subcategoryId: Types.Scalars["Int"]["input"];
  teacherId: Types.Scalars["Int"]["input"];
  userId: Types.Scalars["Int"]["input"];
}>;

export type AddChestToUserMutation = {
  __typename?: "mutation_root";
  addChestToUser?: {
    __typename?: "ChestHistoryType";
    chestHistoryId: string;
    createdAt: string;
    label: string;
    opened: boolean;
    updatedAt: string;
    user: {
      __typename?: "UserType";
      secondName: string;
      firstName: string;
      userId: string;
    };
  } | null;
};

export const AddChestToUserDocument = gql`
  mutation AddChestToUser(
    $chestId: Int!
    $subcategoryId: Int!
    $teacherId: Int!
    $userId: Int!
  ) {
    addChestToUser(
      chestId: $chestId
      subcategoryId: $subcategoryId
      teacherId: $teacherId
      userId: $userId
    ) {
      chestHistoryId
      createdAt
      label
      opened
      updatedAt
      user {
        secondName
        firstName
        userId
      }
    }
  }
`;
export type AddChestToUserMutationFn = Apollo.MutationFunction<
  AddChestToUserMutation,
  AddChestToUserMutationVariables
>;

/**
 * __useAddChestToUserMutation__
 *
 * To run a mutation, you first call `useAddChestToUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddChestToUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addChestToUserMutation, { data, loading, error }] = useAddChestToUserMutation({
 *   variables: {
 *      chestId: // value for 'chestId'
 *      subcategoryId: // value for 'subcategoryId'
 *      teacherId: // value for 'teacherId'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useAddChestToUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddChestToUserMutation,
    AddChestToUserMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    AddChestToUserMutation,
    AddChestToUserMutationVariables
  >(AddChestToUserDocument, options);
}
export type AddChestToUserMutationHookResult = ReturnType<
  typeof useAddChestToUserMutation
>;
export type AddChestToUserMutationResult =
  Apollo.MutationResult<AddChestToUserMutation>;
export type AddChestToUserMutationOptions = Apollo.BaseMutationOptions<
  AddChestToUserMutation,
  AddChestToUserMutationVariables
>;
