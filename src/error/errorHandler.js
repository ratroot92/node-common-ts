/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const ApiError = require('./apiError');
const mongooseErrors = require('./mongooseErrors');
const Response = require('../Response');

function errorHandler(err, req, res, next) {
  err.status = err.status || 500;
  err.message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    console.log('**** - errorHandler - ****');
    console.log('err.message ==>', err.message);
    console.log('err.stack ==>', err.stack);
    console.log('**** - errorHandler - ****');
  }

  if (err.name === 'CastError') {
    err = mongooseErrors.handleCastErrorDB(err);
  }
  if (err.name === 'ValidationError') {
    err = mongooseErrors.handleValidationErrorDB(err);
  }
  if (err.code === 11000) {
    let message = handleDuplicateFieldError(err);
    err = new ApiError({ status: 400, message });
  }
  if (err.name === 'JsonWebTokenError') {
    err = mongooseErrors.handleJWTsError();
  }
  if (err.name === 'TokenExpiredError') {
    err = mongooseErrors.handleJWTExpiredError();
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({
      message: err.message,
      success: false,
    });
    return;
  } else {
    res.status(500).json({
      message: 'something went wrong',
      success: false,
    });
  }
}
module.exports = errorHandler;
