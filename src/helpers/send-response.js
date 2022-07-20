const debugLogger = require('./debug-logger');

function sendResponse(options = {}) {
  debugLogger({ logData: 'sendResponse' });
  options.data = options.data || {};
  options.statusCode = options.statusCode || 500;
  options.message = options.message || '';

  return options.res.status(options.statusCode).json({ data: options.data, message: options.message });
}

module.exports = sendResponse;
