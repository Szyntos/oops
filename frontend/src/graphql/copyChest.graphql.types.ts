import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CopyChestMutationVariables = Types.Exact<{
  chestId: Types.Scalars["Int"]["input"];
}>;

export type CopyChestMutation = {
  __typename?: "mutation_root";
  copyChest?: { __typename?: "ChestType"; chestId: string } | null;
};

export const CopyChestDocument = gql`
  mutation CopyChest($chestId: Int!) {
    copyChest(chestId: $chestId) {
      chestId
    }
  }
`;
export type CopyChestMutationFn = Apollo.MutationFunction<
  CopyChestMutation,
  CopyChestMutationVariables
>;

/**
 * __useCopyChestMutation__
 *
 * To run a mutation, you first call `useCopyChestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCopyChestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [copyChestMutation, { data, loading, error }] = useCopyChestMutation({
 *   variables: {
 *      chestId: // value for 'chestId'
 *   },
 * });
 */
export function useCopyChestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CopyChestMutation,
    CopyChestMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CopyChestMutation, CopyChestMutationVariables>(
    CopyChestDocument,
    options,
  );
}
export type CopyChestMutationHookResult = ReturnType<
  typeof useCopyChestMutation
>;
export type CopyChestMutationResult = Apollo.MutationResult<CopyChestMutation>;
export type CopyChestMutationOptions = Apollo.BaseMutationOptions<
  CopyChestMutation,
  CopyChestMutationVariables
>;
