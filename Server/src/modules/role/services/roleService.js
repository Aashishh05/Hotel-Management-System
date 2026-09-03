import ErrorHandler from "../../../utils/errorHandler.js";
import roleRepository from "../repository/roleRepository.js";

const createRole = async (roleData) => {
  const existingRole = await roleRepository.getRoleByName(roleData.name);

  if (existingRole) {
    throw new ErrorHandler("Role already exists", 400);
  }

  return await roleRepository.createRole(roleData);
};
const getAllRoles = async () => {
  return await roleRepository.getAllRole();
};

export const getRoleById = async (id) => {
  const role = await roleRepository.getRoleById(id);

  if (!role) {
    throw new ErrorHandler("Role not found", 404);
  }

  return role;
};

const updateRole = async (id, roleData) => {
  const role = await roleRepository.updateRole(id);

  if (!role) {
    throw new ErrorHandler("Role not found", 404);
  }

  if (roleData.name && roleData.name !== role.name) {
    const existingRole = await roleRepository.getRoleByName(roleData.name);

    if (existingRole) {
      throw new ErrorHandler("Role already exists", 400);
    }
  }

  return await roleRepository.updateRole(id, roleData);
};

const deleteRole = async (id) => {
  const role = await roleRepository.getRoleById(id);

  if (!role) {
    throw new ErrorHandler("Role not found", 404);
  }

  return await roleRepository.deleteRole(id);
};

export default { createRole, getRoleById, getAllRoles, updateRole, deleteRole };
