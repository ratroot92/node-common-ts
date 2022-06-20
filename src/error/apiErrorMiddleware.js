/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
const { MalikLogger } = require("../logger");
const ApiError = require("./error");

function ApiErrorMiddleware(err, req, res, next) {
  // in production dont use
  // because it is not async
  console.log("process.env.NODE_ENV", process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    // MalikLogger.inspectObject(err);
    console.log(err.stack);
  }
  if (err instanceof ApiError) {
    res.status(err.code).json({
      message: err.message,
      success: false,
    });
    return;
  }
  res.status(500).json({
    message: "something went wrong",
    success: false,
  });
}
module.exports = ApiErrorMiddleware;
