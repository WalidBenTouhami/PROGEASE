export const environment = {
  production: true,
  apiUrl: 'https://api.progease.com',
  graphqlUri: 'https://api.progease.com/graphql',
  appVersion: '1.0.0',
  appName: 'PROGEASE',
  version: '1.0.0',
  sentry: {
    dsn: 'YOUR_SENTRY_DSN', // Replace with your actual Sentry DSN
    environment: 'production',
    tracesSampleRate: 0.2,
    maxBreadcrumbs: 50,
    attachStacktrace: true
  }
};
