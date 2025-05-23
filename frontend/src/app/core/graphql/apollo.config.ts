import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { APOLLO_OPTIONS } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';

@NgModule({
  imports: [
    HttpClientModule,
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink): ApolloClientOptions<any> => {
        return {
          link: httpLink.create({
            uri: 'http://localhost:3000/graphql',
          }),
          cache: new InMemoryCache(),
          defaultOptions: {
            watchQuery: {
              fetchPolicy: 'network-only',
              errorPolicy: 'all',
            },
            query: {
              fetchPolicy: 'network-only',
              errorPolicy: 'all',
            },
          },
        };
      },
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {} 