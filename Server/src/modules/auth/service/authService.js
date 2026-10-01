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

const RESET_TOKEN_TTL_MINUTES = 10;

// Sent for every request so the endpoint cannot be used to discover which
// addresses are registered.
const RESET_REQUEST_MESSAGE =
  "If the email is registered, a reset link will be sent.";

const forgotPassword = async (email) => {
  const user = await authRepository.findUserByEmail(email);

  if (!user) {
    return { message: RESET_REQUEST_MESSAGE };
  }

  const resetToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256") // create a SHA-256 hash of the token : hashing algorithm that transforms input data into a fixed-length hash.
    .update(resetToken)
    .digest("hex");  // hex digest of the token for secure storage :(0-9 & a-f)

  const resetPasswordExpire =
    Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000;

  await authRepository.saveResetToken(
    user._id,
    hashedToken,
    resetPasswordExpire,
  );

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Grand Horizon Hotel - password reset",
      message: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:32px;border:1px solid #e8e2d6;border-radius:12px;">
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#C9A15A;">Grand Horizon Hotel</p>
          <h1 style="margin:0 0 20px;font-size:24px;color:#1c1917;">Reset your password</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#44403c;">
            Hi ${user.name}, we received a request to reset the password for your account.
          </p>
          <p style="margin:0 0 24px;">
            <a href="${resetUrl}" style="display:inline-block;background:#C9A15A;color:#1c1917;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600;font-size:15px;">Reset Password</a>
          </p>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#57534e;">
            This link expires in <strong>${RESET_TOKEN_TTL_MINUTES} minutes</strong> and can only be used once.
          </p>
          <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#57534e;">
            If the button does not work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color:#C9A15A;word-break:break-all;">${resetUrl}</a>
          </p>
          <p style="margin:0;padding-top:16px;border-top:1px solid #e8e2d6;font-size:13px;line-height:1.6;color:#78716c;">
            If you did not request a password reset, you can safely ignore this email and your password will stay unchanged.
          </p>
        </div>
      `,
    });
  } catch (error) {
    // A stored token the user never received would lock them out, so drop it
    // and let them try again.
    await authRepository.saveResetToken(user._id, null, null);
    throw new ErrorHandler("Email could not be sent. Please try again.", 500);
  }

  return { message: RESET_REQUEST_MESSAGE };
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
