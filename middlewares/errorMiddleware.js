const ApiError = require("../utils/apiError");

const developmentError = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const productionError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
const handleInvalidSignature = () =>
  new ApiError("invalid token, please login again...", 401);
const handleExpiredToken = () =>
  new ApiError("expired token, please login again...", 401);

const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    developmentError(err, res);
  } else {
    if (err.name === "JsonWebTokenError") {
      err = handleInvalidSignature();
    }
    if (err.name === "TokenExpiredError") {
      err = handleExpiredToken();
    }
    productionError(err, res);
  }
};

module.exports = globalErrorHandler;
