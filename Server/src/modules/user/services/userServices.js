import ErrorHandler from "../../../utils/ErrorHandler.js";
import roleRepository from "../../role/repository/roleRepository.js";
import userRepository from "../repository/userRepository.js";
import bcrypt from "bcrypt";
import auditLogServices from "../../auditlog/services/auditLogServices.js";

const createUser = async (userData, userId) => {
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

  const created = await userRepository.createUser(newUser);

  await auditLogServices.recordActivity({
    user: userId,
    action: "user.created",
    module: "users",
    targetId: created._id,
    description: `User ${created.name || created.email} was created`,
  });

  return created;
};

const getAllUsers = async (options = {}) => {
  if (options.page && options.limit) {
    return await userRepository.getAllUserWithPagination(options);
  }
  return { users: await userRepository.getAllUser() };
};

const getUserById = async (id) => {
  const user = await userRepository.getUserById(id);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return user;
};

const getUsersByRole = async (roleId) => {
  const role = await roleRepository.getRoleById(roleId);

  if (!role) {
    throw new ErrorHandler("Role not found", 404);
  }

  return await userRepository.getUserByRole(roleId);
};

const updateUser = async (id, userData, userId) => {
  const user = await userRepository.getUserById(id);

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

  const updated = await userRepository.updateUser(id, userData);

  await auditLogServices.recordActivity({
    user: userId,
    action: "user.updated",
    module: "users",
    targetId: id,
    description: `User ${user.name || user.email} was updated`,
  });

  return updated;
};

const deleteUser = async (id, userId) => {
  const user = await userRepository.getUserById(id);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  await userRepository.deleteUser(id);

  await auditLogServices.recordActivity({
    user: userId,
    action: "user.deleted",
    module: "users",
    targetId: id,
    description: `User ${user.name || user.email} was removed`,
  });
};

export default {
  createUser,
  getAllUsers,
  getUserById,
  getUsersByRole,
  updateUser,
  deleteUser,
};
