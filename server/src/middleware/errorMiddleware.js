const notFound = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.method} ${req.originalUrl}`
  );

  res.status(404);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  const statusCode =
    res.statusCode && res.statusCode !== 200
      ? res.statusCode
      : 500;

  console.error({
    message: error.message,
    method: req.method,
    path: req.originalUrl,
    stack:
      process.env.NODE_ENV === "development"
        ? error.stack
        : undefined,
  });

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error"
        : error.message,
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
    }),
  });
};

module.exports = {
  notFound,
  errorHandler,
};