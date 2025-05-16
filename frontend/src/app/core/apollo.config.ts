import { provideApollo, APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../../environments/environment';

export function createApollo(httpLink: HttpLink) {
  return new ApolloClient({
    link: httpLink.create({ uri: environment.graphqlUrl }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache', // ou 'cache-first' selon ton besoin
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
}

export const apolloProviders = [
  provideApollo(),
  {
    provide: APOLLO_OPTIONS,
    useFactory: createApollo,
    deps: [HttpLink],
  },
];
