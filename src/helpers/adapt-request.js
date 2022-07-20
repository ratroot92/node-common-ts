const debugLogger = require('./debug-logger');

function adaptRequest(req, res, next) {
  debugLogger({ logData: 'adaptRequest' });
  req.args = Object.freeze({
    pathParams: req.params,
    queryParams: req.query,
    kafka: req.kafka,
    method: req.method,
    body: req.body,
  });
  return next();
}

module.exports = adaptRequest;
