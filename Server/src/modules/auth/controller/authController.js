import authService from "../service/authService.js";
import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import auditLogServices from "../../auditlog/services/auditLogServices.js";
import {
  verifyToken,
  verifyRefreshToken,
} from "../../../utils/jwt.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";

const roleName = (user) => user?.role?.name || "guest";

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

export const register = asyncErrorHandler(async (req, res) => {
  const user = await authService.register(req.body);

  await auditLogServices.recordActivity({
    user: user._id,
    action: "auth.registered",
    module: "auth",
    targetId: user._id,
    description: `${user.name} registered as ${roleName(user)}`,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
});

export const login = asyncErrorHandler(async (req, res) => {
  let user;
  let accessToken;
  let refreshToken;

  try {
    ({ user, accessToken, refreshToken } = await authService.login(req.body));
  } catch (error) {
    await auditLogServices.recordActivity({
      user: null,
      action: "auth.login_failed",
      module: "auth",
      description: `Failed login attempt for ${req.body.email}`,
      status: "failed",
    });

    throw error;
  }

  res.cookie("token", accessToken, {
    ...cookieOptions(),
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions(),
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });

  await auditLogServices.recordActivity({
    user: user._id,
    action: "auth.login",
    module: "auth",
    targetId: user._id,
    description: `${user.name} logged in as ${roleName(user)}`,
  });

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: user,
  });
});

export const logout = asyncErrorHandler(async (req, res) => {
  const options = cookieOptions();

  res.clearCookie("token", options);
  res.clearCookie("refreshToken", options);

  const token = req.cookies?.token;

  if (token) {
    try {
      const decoded = verifyToken(token);

      await auditLogServices.recordActivity({
        user: decoded.id,
        action: "auth.logout",
        module: "auth",
        targetId: decoded.id,
        description: `${decoded.name || "A user"} logged out${
          decoded.role ? ` as ${decoded.role}` : ""
        }`,
      });
    } catch {
      // An expired or tampered token is not worth logging.
    }
  }

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

export const refresh = asyncErrorHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new ErrorHandler("No refresh token provided", 401);
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ErrorHandler("Invalid or expired refresh token", 401);
  }

  const { user, accessToken, refreshToken } = await authService.refreshSession(
    decoded.id,
  );

  res.cookie("token", accessToken, {
    ...cookieOptions(),
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions(),
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });

  res.status(200).json({
    success: true,
    message: "Access token refreshed",
    data: user,
  });
});

export const getMe = asyncErrorHandler(async (req, res) => {
  if (!req.user) {
    if (req.authExpired) {
      // Access token present but expired/invalid. The client interceptor
      // catches this and refreshes before retrying.
      return res
        .status(401)
        .json({ success: false, message: "Access token expired" });
    }

    return res.status(200).json({ success: true, data: null });
  }

  const user = await authService.getMe(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const forgotPassword = asyncErrorHandler(async (req, res) => {
  const { email } = req.body;

  const result = await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const resetPassword = asyncErrorHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const result = await authService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});
