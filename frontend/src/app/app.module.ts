import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app-routing.module';
import { apolloProviders } from './core/apollo.config';
import { authInterceptor } from './core/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    ),
    provideRouter(routes),
    ...apolloProviders,
  ],
}).catch(err => console.error(err));
