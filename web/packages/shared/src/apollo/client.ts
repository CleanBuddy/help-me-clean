import { ApolloClient, ApolloLink, InMemoryCache, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';

export function createApolloClient(graphqlEndpoint: string, wsEndpoint?: string) {
  const uploadLink = createUploadLink({
    uri: graphqlEndpoint,
  }) as unknown as ApolloLink;

  const authLink = setContext((_, { headers }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  let link = authLink.concat(uploadLink);

  if (wsEndpoint) {
    const wsLink = new GraphQLWsLink(
      createClient({
        url: wsEndpoint,
        connectionParams: () => {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    );

    link = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(uploadLink),
    );
  }

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
}
