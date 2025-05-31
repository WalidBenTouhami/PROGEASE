export const environment = {
  production: false,
  appName: 'PROGEASE',
  version: '2.0.0',
  apiUrl: 'http://localhost:3000',
  graphqlUri: 'http://localhost:3000/graphql',
  defaultLanguage: 'fr',
  supportedLanguages: ['fr', 'en'],
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50]
  },
  refreshTokenInterval: 3600000, // 1 heure
  sessionTimeout: 7200000, // 2 heures
  toastDuration: 3000, // 3 secondes
  debounceTime: 300, // 300ms
  features: {
    darkMode: true,
    notifications: true,
    analytics: true,
    multiLanguage: false,
    enableGraphQL: true,
    enableWebSocket: false,
    enablePWA: false
  }
};
