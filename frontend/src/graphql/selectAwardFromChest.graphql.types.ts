import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SelectAwardFromChestMutationVariables = Types.Exact<{
  awardIds:
    | Array<Types.Scalars["Int"]["input"]>
    | Types.Scalars["Int"]["input"];
  chestHistoryId: Types.Scalars["Int"]["input"];
}>;

export type SelectAwardFromChestMutation = {
  __typename?: "mutation_root";
  addBonus: Array<{
    __typename?: "AddBonusReturnType";
    bonus: { __typename?: "BonusType"; bonusId: string };
  }>;
};

export const SelectAwardFromChestDocument = gql`
  mutation SelectAwardFromChest($awardIds: [Int!]!, $chestHistoryId: Int!) {
    addBonus(awardIds: $awardIds, chestHistoryId: $chestHistoryId) {
      bonus {
        bonusId
      }
    }
  }
`;
export type SelectAwardFromChestMutationFn = Apollo.MutationFunction<
  SelectAwardFromChestMutation,
  SelectAwardFromChestMutationVariables
>;

/**
 * __useSelectAwardFromChestMutation__
 *
 * To run a mutation, you first call `useSelectAwardFromChestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSelectAwardFromChestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [selectAwardFromChestMutation, { data, loading, error }] = useSelectAwardFromChestMutation({
 *   variables: {
 *      awardIds: // value for 'awardIds'
 *      chestHistoryId: // value for 'chestHistoryId'
 *   },
 * });
 */
export function useSelectAwardFromChestMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SelectAwardFromChestMutation,
    SelectAwardFromChestMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SelectAwardFromChestMutation,
    SelectAwardFromChestMutationVariables
  >(SelectAwardFromChestDocument, options);
}
export type SelectAwardFromChestMutationHookResult = ReturnType<
  typeof useSelectAwardFromChestMutation
>;
export type SelectAwardFromChestMutationResult =
  Apollo.MutationResult<SelectAwardFromChestMutation>;
export type SelectAwardFromChestMutationOptions = Apollo.BaseMutationOptions<
  SelectAwardFromChestMutation,
  SelectAwardFromChestMutationVariables
>;
