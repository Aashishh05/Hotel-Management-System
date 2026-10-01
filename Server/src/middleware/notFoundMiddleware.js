// Without this, an unmatched path falls through to Express's built-in 404,
// which replies with HTML while every other endpoint replies with JSON.
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export default notFound;
