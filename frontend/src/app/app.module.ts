// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { apolloProviders } from './core/apollo.config';
import { ApiTesterComponent } from './core/components/api-tester/api-tester.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    ...apolloProviders,
  ],
}).catch(err => console.error(err));
