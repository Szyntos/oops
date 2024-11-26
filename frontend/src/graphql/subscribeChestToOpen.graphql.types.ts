import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SubscribeChestToOpenSubscriptionVariables = Types.Exact<{
  userId: Types.Scalars["bigint"]["input"];
}>;

export type SubscribeChestToOpenSubscription = {
  __typename?: "subscription_root";
  users: Array<{
    __typename?: "Users";
    chestHistories: Array<{
      __typename?: "ChestHistory";
      chestHistoryId: string;
      chestId: string;
      createdAt: string;
      label: string;
      opened: boolean;
      subcategoryId: string;
      updatedAt: string;
      teacherId: string;
      userId: string;
      chest: {
        __typename?: "Chests";
        active: boolean;
        awardBundleCount: number;
        imageFileId?: string | null;
        label: string;
        type: string;
        chestAwards: Array<{
          __typename?: "ChestAward";
          award: {
            __typename?: "Award";
            awardId: string;
            awardName: string;
            awardType: string;
            awardValue: string;
            categoryId: string;
            description: string;
            imageFileId?: string | null;
            label: string;
            maxUsages: number;
          };
        }>;
      };
    }>;
  }>;
};

export const SubscribeChestToOpenDocument = gql`
  subscription SubscribeChestToOpen($userId: bigint!) {
    users(where: { userId: { _eq: $userId } }) {
      chestHistories(
        where: { opened: { _eq: false }, userId: { _eq: $userId } }
      ) {
        chestHistoryId
        chestId
        createdAt
        label
        opened
        subcategoryId
        updatedAt
        teacherId
        userId
        chest {
          chestAwards {
            award {
              awardId
              awardName
              awardType
              awardValue
              categoryId
              description
              imageFileId
              label
              maxUsages
            }
          }
          active
          awardBundleCount
          imageFileId
          label
          type
        }
      }
    }
  }
`;

/**
 * __useSubscribeChestToOpenSubscription__
 *
 * To run a query within a React component, call `useSubscribeChestToOpenSubscription` and pass it any options that fit your needs.
 * When your component renders, `useSubscribeChestToOpenSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubscribeChestToOpenSubscription({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useSubscribeChestToOpenSubscription(
  baseOptions: Apollo.SubscriptionHookOptions<
    SubscribeChestToOpenSubscription,
    SubscribeChestToOpenSubscriptionVariables
  > &
    (
      | { variables: SubscribeChestToOpenSubscriptionVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSubscription<
    SubscribeChestToOpenSubscription,
    SubscribeChestToOpenSubscriptionVariables
  >(SubscribeChestToOpenDocument, options);
}
export type SubscribeChestToOpenSubscriptionHookResult = ReturnType<
  typeof useSubscribeChestToOpenSubscription
>;
export type SubscribeChestToOpenSubscriptionResult =
  Apollo.SubscriptionResult<SubscribeChestToOpenSubscription>;
