import authService from "../service/authService.js";
import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";

export const register = asyncErrorHandler(async (req, res) => {
  const user = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user,
  });
});

export const login = asyncErrorHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: user,
  });
});

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

export const getMe = asyncErrorHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
