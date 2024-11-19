import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CopyAwardMutationVariables = Types.Exact<{
  awardId: Types.Scalars["Int"]["input"];
}>;

export type CopyAwardMutation = {
  __typename?: "mutation_root";
  copyAward?: { __typename?: "AwardType"; awardId: string } | null;
};

export const CopyAwardDocument = gql`
  mutation CopyAward($awardId: Int!) {
    copyAward(awardId: $awardId) {
      awardId
    }
  }
`;
export type CopyAwardMutationFn = Apollo.MutationFunction<
  CopyAwardMutation,
  CopyAwardMutationVariables
>;

/**
 * __useCopyAwardMutation__
 *
 * To run a mutation, you first call `useCopyAwardMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCopyAwardMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [copyAwardMutation, { data, loading, error }] = useCopyAwardMutation({
 *   variables: {
 *      awardId: // value for 'awardId'
 *   },
 * });
 */
export function useCopyAwardMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CopyAwardMutation,
    CopyAwardMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CopyAwardMutation, CopyAwardMutationVariables>(
    CopyAwardDocument,
    options,
  );
}
export type CopyAwardMutationHookResult = ReturnType<
  typeof useCopyAwardMutation
>;
export type CopyAwardMutationResult = Apollo.MutationResult<CopyAwardMutation>;
export type CopyAwardMutationOptions = Apollo.BaseMutationOptions<
  CopyAwardMutation,
  CopyAwardMutationVariables
>;
