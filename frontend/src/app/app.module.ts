import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { apolloProviders } from './core/apollo.config';

@NgModule({
  declarations: [
    AppComponent,
    // autres composants si tu en as
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    // autres modules si besoin
  ],
  providers: [
    ...apolloProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
