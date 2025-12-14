import './polyfills';
import { enableProdMode, isDevMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Sentry from '@sentry/angular';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

// Initialize Sentry for error tracking (only in production)
if (environment.production) {
  Sentry.init({
    dsn: environment.sentry.dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracePropagationTargets: ['localhost', environment.apiUrl],
    tracesSampleRate: 0.2,
    environment: 'production',
    enabled: true,
  });
}

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
