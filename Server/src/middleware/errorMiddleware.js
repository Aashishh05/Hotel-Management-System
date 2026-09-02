import ErrorHandler from "../utils/errorHandler.js";

const errorMiddleware = (err, req, res, next) => {
  // Default error values
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    err = new ErrorHandler("Resource not found", 404);
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;

    err = new ErrorHandler(message, 400);
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");

    err = new ErrorHandler(message, 400);
  }

  // JWT Invalid Token Error
  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler("Invalid Token", 401);
  }

  // JWT Expired Token Error
  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler("Token Expired", 401);
  }

  // Send error response
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default errorMiddleware;
