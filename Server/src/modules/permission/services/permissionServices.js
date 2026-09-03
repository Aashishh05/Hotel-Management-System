import roleRepository from "../../role/repository/roleRepository.js";
import errorHandler from "../../../utils/ErrorHandler.js";
import permissionRepository from "../repository/permissionRepository";

const createPermission = async (permissionData) => {
  const role = await roleRepository.getRoleById(permissionData.role);

  if (!role) {
    throw new errorHandler("Role not found", 404);
  }

  const existingPermission = await permissionRepository.getPermissionByRole(
    permissionData.role,
  );

  if (existingPermission) {
    throw new errorHandler("Permission already exists for this role", 400);
  }
  return await permissionRepository.createPermission(permissionData);
};

const getAllPermission = async () => {
  return await permissionRepository.getAllPermission();
};

const getPermissionById = async (id) => {
  const permission = await permissionRepository.getPermissionById(id);

  if (!permission) {
    throw new errorHandler("Permission not found", 404);
  }
  return permission;
};

const getPermissionByRole = async (roleId) => {
  const role = await roleRepository.getRoleById(roleId);

  if (!role) {
    throw new errorHandler("Role not found", 404);
  }

  const permission = await permissionRepository.getPermissionByRole(roleId);

  if (!permission) {
    throw new errorHandler("permission not found for this role", 404);
  }
  return permission;
};

const updatePermissionByRole = async (roleId, permissionData) => {
  const role = await roleRepository.getRoleById(roleId);

  if (!role) {
    throw new errorHandler("Role not found", 404);
  }

  const permission = await permissionRepository.getPermissionByRole(roleId);

  if (!permission) {
    throw new errorHandler("permission not found for this role", 404);
  }

  return await permissionRepository.updatePermissionByRole(
    roleId,
    permissionData,
  );
};

const deletePermissionByRole = async (roleId) => {
  const permission = await permissionRepository.getPermissionByRole(roleId);

  if (!permission) {
    throw new errorHandler("permission not found for this role", 404);
  }

  return await permissionRepository.deletePermissionByRole(roleId);
};

const getMypermission = async (roleId) => {
  if (!roleId) {
    throw new errorHandler("User role not found", 404);
  }

  const permission = await permissionRepository.getPermissionByRole(roleId);

  if (!permission) {
    throw new errorHandler("permission not found for your role");
  }

  return permission;
};

export default {
  createPermission,
  getAllPermission,
  getPermissionById,
  getPermissionByRole,
  updatePermissionByRole,
  deletePermissionByRole,
  getMypermission,
};
