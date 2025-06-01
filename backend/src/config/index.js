const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/progease',
  jwtSecret: process.env.JWT_SECRET || 'votre_secret_jwt_super_securise',
  jwtExpiresIn: '24h',
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:4200').split(','),
  logLevel: process.env.LOG_LEVEL || 'info'
};

module.exports = config; 