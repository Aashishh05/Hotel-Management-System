import express from "express";
import { body } from "express-validator";

import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controller/authController.js";

import { validate } from "../../../middleware/validateMiddleware.js";
import {
  protectOptional,
} from "../../../middleware/authMiddleware.js";
import {
  loginRateLimiter,
  forgotPasswordRateLimiter,
} from "../../../middleware/rateLimiter.js";

const router = express.Router();

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
];

// The user model enforces the same minimum, so validating here keeps the
// error message friendly instead of surfacing a raw Mongoose error.
const resetPasswordValidation = [
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

router.post("/register", registerValidation, validate, register);
router.post("/login", loginRateLimiter, loginValidation, validate, login);
router.post("/logout", logout);
router.get("/me", protectOptional, getMe);
router.post(
  "/forgot-password",
  forgotPasswordRateLimiter,
  forgotPasswordValidation,
  validate,
  forgotPassword,
);
router.post(
  "/reset-password/:token",
  resetPasswordValidation,
  validate,
  resetPassword,
);

export default router;
