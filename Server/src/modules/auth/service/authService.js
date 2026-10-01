import authRepository from "../repository/authRepository.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../../utils/jwt.js";
import ErrorHandler from "../../../utils/errorHandler.js";
import crypto from "crypto";
import sendEmail from "../../../utils/sendEmail.js";

const DEFAULT_ROLE = "guest";

const register = async ({ name, email, password, role }) => {
  const existingUser = await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new ErrorHandler("User with this email already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let roleId = role;

  if (!roleId) {
    const defaultRole = await authRepository.findRoleByName(DEFAULT_ROLE);
    roleId = defaultRole?._id;
  } else if (typeof role === "string" && !/^[0-9a-fA-F]{24}$/.test(role)) {
    const roleDoc = await authRepository.findRoleByName(role);
    roleId = roleDoc?._id || role;
  }

  if (!roleId) {
    throw new ErrorHandler(
      "Default role not found. Please run the seed script.",
      500,
    );
  }

  const user = await authRepository.createUser({
    name,
    email,
    password: hashedPassword,
    role: roleId,
  });

  const populatedUser = await authRepository.findUserById(user._id);

  return populatedUser;
};

const login = async ({ email, password }) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new ErrorHandler("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ErrorHandler("Invalid email or password", 401);
  }

  const token = generateToken({
    id: user._id,
    name: user.name,
    role: user.role.name,
  });

  return { user, token };
};

const getMe = async (userId) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return user;
};

const forgotPassword = async (email) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256") // create a SHA-256 hash of the token : hashing algorithm that transforms input data into a fixed-length hash.
    .update(resetToken)
    .digest("hex");  // hex digest of the token for secure storage :(0-9 & a-f)

  const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await authRepository.saveResetToken(
    user._id,
    hashedToken,
    resetPasswordExpire,
  );

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "HOTEL MANAGEMENT SYSTEM - password reset OTP",
      message: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below to set a new password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 15 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      `,
    });
  } catch (error) {
    await authRepository.saveResetToken(user._id, null, null);
    throw new ErrorHandler("Email could not be sent", 500);
  }

  return {
    message: "If the email is registered, a reset link will be sent.",
  };
};

const resetPassword = async (refreshToken, newPassword) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const user = await authRepository.findUserByResetToken(hashedToken);
  if (!user) {
    throw new ErrorHandler("Invalid or expired reset token", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await authRepository.updatePassword(user._id, hashedPassword);

  return {
    message:
      "Password reset successful. You can now log in with your new password.",
  };
};
export default {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};
