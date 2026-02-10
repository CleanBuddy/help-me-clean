import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

export function createApolloClient(graphqlEndpoint: string, wsEndpoint?: string) {
  const httpLink = createHttpLink({
    uri: graphqlEndpoint,
  });

  const authLink = setContext((_, { headers }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  let link = authLink.concat(httpLink);

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
      authLink.concat(httpLink),
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
