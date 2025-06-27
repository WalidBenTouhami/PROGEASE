export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  graphqlUrl: 'http://localhost:5000/graphql',
  appName: 'PROGEASE (Dev)',
  version: '2.0.0',
  defaultLanguage: 'fr',
  supportedLanguages: ['fr', 'en'],
  defaultPageSize: 10,
  maxPageSize: 100,
  debounceTime: 300,
  toastDuration: 3000,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  refreshTokenInterval: 10 * 60 * 1000, // 10 minutes
  sentry: {
    dsn: 'YOUR_SENTRY_DSN', // Replace with your actual Sentry DSN
    environment: 'development',
    tracesSampleRate: 1.0,
    maxBreadcrumbs: 50,
    attachStacktrace: true
  },
  features: {
    darkMode: true,
    notifications: true,
    offline: false,
    analytics: false
  }
}; 