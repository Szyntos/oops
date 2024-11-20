import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { ReactNode } from "react";
import { GRAPHQL_URI } from "../utils/constants";
import Cookies from "js-cookie";
import { cookiesStrings } from "../hooks/auth/useLogin";
import { UsersRolesType } from "../__generated__/schema.graphql.types";
import { createClient } from "graphql-ws";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";

const httpLink = createHttpLink({
  uri: GRAPHQL_URI,
});

export const getHeaders = () => {
  const token = Cookies.get(cookiesStrings.token);
  const cookieUser = Cookies.get(cookiesStrings.user);
  const parsedUser = cookieUser ? JSON.parse(cookieUser) : undefined;

  const roleHeaders = parsedUser
    ? {
        "x-hasura-user-id": parsedUser.userId,
        "x-hasura-role": parsedUser.role.toLowerCase(),
      }
    : {
        "x-hasura-role": UsersRolesType.UnauthenticatedUser.toLowerCase(),
      };

  return {
    // TODO: Remove secret
    "x-hasura-admin-secret": "admin_secret",
    ...roleHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const createAuthLink = () =>
  setContext(async (_, { headers }) => ({
    headers: {
      ...headers,
      ...getHeaders(),
    },
  }));

const createWebSocketLink = () => {
  const wsClient = createClient({
    url: GRAPHQL_URI.replace(/^http/, "ws"),
    connectionParams: () => ({
      headers: getHeaders(),
    }),
  });

  return new GraphQLWsLink(wsClient);
};

const initializeApolloClient = () => {
  const authLink = createAuthLink();
  const wsLink = createWebSocketLink();

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    authLink.concat(httpLink),
  );

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
};

export const ApolloClientProvider = ({ children }: { children: ReactNode }) => {
  const client = initializeApolloClient();

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
