import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { ApolloModule } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { apolloProviders } from './core/apollo.config';
import { ApiTesterComponent } from './core/components/api-tester/api-tester.component';
import { GraphQLModule } from './graphql.module';

@NgModule({
  declarations: [
    AppComponent,
    ApiTesterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ApolloModule,
    GraphQLModule
  ],
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    ...apolloProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { } 