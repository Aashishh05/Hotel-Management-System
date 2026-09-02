import authRepository from "../repository/authRepository.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../../utils/jwt.js";
import ErrorHandler from "../../../utils/errorHandler.js";

const register = async ({ name, email, password, role }) => {
  const existingUser = await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new ErrorHandler("User with this email already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await authRepository.createUser({
    name,
    email,
    password: hashedPassword,
    role,
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

export default {
  register,
  login,
  getMe,
};
