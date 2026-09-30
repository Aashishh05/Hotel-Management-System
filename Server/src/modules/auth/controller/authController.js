import authService from "../service/authService.js";
import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import auditLogServices from "../../auditlog/services/auditLogServices.js";
import { verifyToken } from "../../../utils/jwt.js";

const roleName = (user) => user?.role?.name || "guest";

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
  let token;

  try {
    ({ user, token } = await authService.login(req.body));
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

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
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
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

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

export const getMe = asyncErrorHandler(async (req, res) => {
  if (!req.user) {
    return res.status(200).json({ success: true, data: null });
  }

  const user = await authService.getMe(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
