import ErrorHandler from "../../../utils/ErrorHandler.js";
import roleRepository from "../../role/repository/roleRepository.js";
import userRepository from "../repository/userRepository.js";
import bcrypt from "bcrypt";

const createUser = async (userData) => {
  const { email, password, role } = userData;
  const esxistingUser = await userRepository.getUserByEmail(email);

  if (esxistingUser) {
    throw new ErrorHandler("User already exists", 400);
  }

  if (role) {
    const existingrole = await roleRepository.getRoleById(role);

    if (!existingrole) {
      throw new ErrorHandler("Role not found", 404);
    }
  }

  if (!password) {
    throw new ErrorHandler("Password is required", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    ...userData,
    password: hashedPassword,
  };

  return await userRepository.createUser(newUser);
};

const getAllUsers = async () => {
  return await userRepository.getAllUser();
};

const getuserById = async (id) => {
  const user = await userRepository.getUserById(id);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return user;
};

const getUserByRole = async (roleId) => {
  const role = await roleRepository.getRoleById(roleId);

  if (!role) {
    throw new ErrorHandler("Role not found", 404);
  }

  return await userRepository.getUserByRole(roleId);
};

const updateUser = async (id, userData) => {
  const user = await userRepository.getuserbyid(id);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  if (userData.email && userData.email !== user.email) {
    const existingUser = await userRepository.getUserByEmail(userData.email);

    if (existingUser) {
      throw new ErrorHandler("Email already in use", 400);
    }
  }

  if (userData.role) {
    const role = await roleRepository.getRoleById(userData.role);

    if (!role) {
      throw new ErrorHandler("Role not found", 404);
    }
  }

  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }

  return await userRepository.updateUser(id, userData);
};

const deleteUser = async (id) => {
  const user = await userRepository.getUserById(id);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return await userRepository.deleteUser(id);
};

export default {
  createUser,
  getAllUsers,
  getuserById,
  getUserByRole,
  updateUser,
  deleteUser,
};
