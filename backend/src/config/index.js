require('dotenv').config();
const path = require('path');

const config = {
    // Server configuration
    serveur: {
        port: process.env.PORT || 4000,
        environnement: process.env.NODE_ENV || 'development',
        timeout: parseInt(process.env.SERVER_TIMEOUT) || 30000,
        compression: process.env.ENABLE_COMPRESSION === 'true',
        trustProxy: process.env.TRUST_PROXY === 'true',
    },

    // Ajout de "cors" à la racine pour compatibilité avec app.js ligne 52
    cors: {
        origine: process.env.CORS_ORIGIN || process.env.APP_ORIGINE || 'http://localhost:3000',
        methodes: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS').split(','),
    },

    // Database configuration adaptée pour app.js
    baseDeDonnees: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/progease',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
            minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 2,
            connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000,
            socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
            serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
            heartbeatFrequencyMS: parseInt(process.env.DB_HEARTBEAT_FREQUENCY) || 10000,
            retryWrites: true,
            w: 'majority',
            readPreference: 'secondaryPreferred',
            ssl: process.env.DB_SSL === 'true',
            sslValidate: process.env.DB_SSL_VALIDATE === 'true',
            sslCA: process.env.DB_SSL_CA,
            authSource: process.env.DB_AUTH_SOURCE || 'admin',
            authMechanism: process.env.DB_AUTH_MECHANISM || 'SCRAM-SHA-256',
        },
    },

    // Conserver la structure existante
    server: {
        port: process.env.PORT || 4000,
        env: process.env.NODE_ENV || 'development',
        timeout: parseInt(process.env.SERVER_TIMEOUT) || 30000,
        compression: process.env.ENABLE_COMPRESSION === 'true',
        trustProxy: process.env.TRUST_PROXY === 'true',
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            methods: (process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS').split(','),
            credentials: process.env.CORS_CREDENTIALS === 'true',
            maxAge: parseInt(process.env.CORS_MAX_AGE) || 86400,
        },
    },

    // Conserver la structure mongodb existante
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/progease',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 10,
            minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 2,
            connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000,
            socketTimeoutMS: parseInt(process.env.DB_SOCKET_TIMEOUT) || 45000,
            serverSelectionTimeoutMS: parseInt(process.env.DB_SERVER_SELECTION_TIMEOUT) || 5000,
            heartbeatFrequencyMS: parseInt(process.env.DB_HEARTBEAT_FREQUENCY) || 10000,
            retryWrites: true,
            w: 'majority',
            readPreference: 'secondaryPreferred',
            ssl: process.env.DB_SSL === 'true',
            sslValidate: process.env.DB_SSL_VALIDATE === 'true',
            sslCA: process.env.DB_SSL_CA,
            authSource: process.env.DB_AUTH_SOURCE || 'admin',
            authMechanism: process.env.DB_AUTH_MECHANISM || 'SCRAM-SHA-256',
        },
    },

    // Authentication configuration
    auth: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        algorithm: process.env.JWT_ALGORITHM || 'HS256',
        issuer: process.env.JWT_ISSUER || 'progease-api',
        audience: process.env.JWT_AUDIENCE || 'progease-client',
        refreshToken: {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
            secret: process.env.REFRESH_TOKEN_SECRET,
        },
        password: {
            saltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS) || 10,
            minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
        },
    },

    // Email configuration
    email: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        secure: process.env.SMTP_SECURE === 'true',
        from: process.env.EMAIL_FROM || 'noreply@progease.com',
        templates: {
            dir: path.join(__dirname, '../templates/email'),
        },
    },

    // File upload configuration
    upload: {
        dir: process.env.UPLOAD_DIR || 'uploads',
        maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        allowedTypes: (
            process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf'
        ).split(','),
        compression: {
            enabled: process.env.ENABLE_FILE_COMPRESSION === 'true',
            quality: parseInt(process.env.COMPRESSION_QUALITY) || 80,
        },
    },

    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'json',
        dir: process.env.LOG_DIR || 'logs',
        rotation: {
            enabled: process.env.ENABLE_LOG_ROTATION === 'true',
            maxSize: process.env.MAX_LOG_SIZE || '20m',
            maxFiles: parseInt(process.env.MAX_LOG_FILES) || 5,
        },
    },

    // Rate limiting configuration
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
        message: process.env.RATE_LIMIT_MESSAGE || 'Too many requests, please try again later',
        skip: req => {
            return (
                process.env.NODE_ENV === 'development' ||
                req.path.startsWith('/api-docs') ||
                req.path.startsWith('/health')
            );
        },
    },

    // Cache configuration
    cache: {
        enabled: process.env.ENABLE_CACHE === 'true',
        type: process.env.CACHE_TYPE || 'redis',
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB) || 0,
            keyPrefix: process.env.REDIS_KEY_PREFIX || 'progease:',
        },
        ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour
    },

    // Security configuration
    security: {
        bcrypt: {
            saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
        },
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ['\'self\''],
                    scriptSrc: ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''],
                    styleSrc: ['\'self\'', '\'unsafe-inline\''],
                    imgSrc: ['\'self\'', 'data:', 'https:'],
                    connectSrc: ['\'self\'', 'https://api.example.com'],
                },
            },
        },
    },
};

// Validate required configurations
const requiredConfigs = ['MONGODB_URI', 'JWT_SECRET', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];

const missingConfigs = requiredConfigs.filter(key => !process.env[key]);

if (missingConfigs.length > 0) {
    throw new Error(`Missing required environment variables: ${missingConfigs.join(', ')}`);
}

module.exports = config;
