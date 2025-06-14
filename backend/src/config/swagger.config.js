const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./index');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PROGEASE API Documentation',
      version: '1.0.0',
      description: 'API documentation for PROGEASE platform',
      contact: {
        name: 'API Support',
        email: 'support@progease.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: 'Development server'
      },
      {
        url: 'https://api.progease.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js',
    './src/controllers/*.js'
  ]
};

const specs = swaggerJsdoc(options);

const swaggerMiddleware = [
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PROGEASE API Documentation',
    customfavIcon: '/favicon.ico'
  })
];

module.exports = {
  specs,
  swaggerMiddleware
}; 