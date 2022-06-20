const catchAsyncErrors = (childFunction) => (req, res, next) => {
  return Promise.resolve(childFunction(req, res, next).catch(next));
};
module.exports = catchAsyncErrors;
