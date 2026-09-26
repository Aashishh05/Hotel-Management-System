import rateLimit from "express-rate-limit";

const emailKeyGenerator = (req) => {
  const email = req.body?.email;

  return typeof email === "string" && email.trim()
    ? email.trim().toLowerCase()
    : req.ip;
};

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per email
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: emailKeyGenerator,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  skipSuccessfulRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again after 1 hour.",
  },
});
