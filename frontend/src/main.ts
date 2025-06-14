import './polyfills';
import { enableProdMode, isDevMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Sentry from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

// Initialize Sentry for error tracking
Sentry.init({
  dsn: environment.sentry.dsn,
  integrations: [
    new BrowserTracing({
      tracingOrigins: ['localhost', environment.apiUrl],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],
  tracesSampleRate: isDevMode() ? 1.0 : 0.2,
  environment: environment.production ? 'production' : 'development',
  enabled: environment.production,
  beforeSend(event) {
    // Don't send events in development
    if (isDevMode()) {
      return null;
    }
    return event;
  },
});

// Enable production mode if in production
if (environment.production) {
  enableProdMode();
}

// Bootstrap the application with error handling
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => {
    console.error('Error bootstrapping application:', err);
    Sentry.captureException(err);
  });
