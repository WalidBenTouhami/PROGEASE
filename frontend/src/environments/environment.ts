export const environment = {
  production: false,
  appName: 'PROGEASE',
  version: '1.0.0',
  apiUrl: 'http://localhost:3000/api',
  graphqlUri: 'http://localhost:3000/graphql',
  enableWebSocket: false,
  enablePWA: false,
  sentry: {
    dsn: 'YOUR_SENTRY_DSN', // Replace with your actual Sentry DSN
    environment: 'development',
    tracesSampleRate: 1.0,
    maxBreadcrumbs: 50,
    attachStacktrace: true
  },
  security: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiryKey: 'token_expiry',
    enableHttps: false,
    enableCSP: true,
    enableXSSProtection: true,
    enableNoSniff: true,
    enableFrameGuard: true,
    enableDNSPrefetchControl: true
  },
  cache: {
    defaultTTL: 300, // 5 minutes
    maxSize: 100, // Maximum number of items
    strategy: 'lru' // Least Recently Used
  },
  logging: {
    level: 'debug',
    enableConsole: true,
    enableRemote: false,
    remoteEndpoint: 'http://localhost:3000/api/logs'
  },
  performance: {
    enableCompression: true,
    enableMinification: true,
    enableTreeShaking: true,
    enableLazyLoading: true,
    enablePreloading: true,
    enablePrefetching: true
  },
  analytics: {
    enabled: false,
    trackingId: 'YOUR_GA_TRACKING_ID',
    debug: true
  }
};
