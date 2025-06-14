const logger = require('../utils/logger');

const versionMiddleware = (options = {}) => {
  const {
    defaultVersion = 'v1',
    supportedVersions = ['v1'],
    versionHeader = 'x-api-version'
  } = options;

  return (req, res, next) => {
    const requestedVersion = req.headers[versionHeader] || defaultVersion;

    if (!supportedVersions.includes(requestedVersion)) {
      logger.warn('Unsupported API version requested:', {
        version: requestedVersion,
        path: req.path,
        method: req.method
      });

      return res.status(400).json({
        success: false,
        message: `Unsupported API version. Supported versions: ${supportedVersions.join(', ')}`
      });
    }

    // Add version to request object
    req.apiVersion = requestedVersion;

    // Add version to response headers
    res.setHeader(versionHeader, requestedVersion);

    // Modify the path to include version
    const versionedPath = `/${requestedVersion}${req.path}`;
    req.originalUrl = versionedPath;
    req.url = versionedPath;

    next();
  };
};

// Version-specific route handler
const versionedRoute = (versions) => {
  return (req, res, next) => {
    const version = req.apiVersion;
    const handler = versions[version];

    if (!handler) {
      return res.status(400).json({
        success: false,
        message: `No handler found for version ${version}`
      });
    }

    handler(req, res, next);
  };
};

module.exports = {
  versionMiddleware,
  versionedRoute
}; 