import ErrorHandler from "../../../utils/errorHandler.js";
import roleRepository from "../repository/roleRepository.js";
import auditLogServices from "../../auditlog/services/auditLogServices.js";

const createRole = async (roleData, userId) => {
  const existingRole = await roleRepository.getRoleByName(roleData.name);

  if (existingRole) {
    throw new ErrorHandler("Role already exists", 400);
  }

  const created = await roleRepository.createRole(roleData);

  await auditLogServices.recordActivity({
    user: userId,
    action: "role.created",
    module: "roles",
    targetId: created._id,
    description: `Role "${created.name}" was created`,
  });

  return created;
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

const updateRole = async (id, roleData, userId) => {
  const role = await roleRepository.getRoleById(id);

  if (!role) {
    throw new ErrorHandler("Role not found", 404);
  }

  if (roleData.name && roleData.name !== role.name) {
    const existingRole = await roleRepository.getRoleByName(roleData.name);

    if (existingRole) {
      throw new ErrorHandler("Role already exists", 400);
    }
  }

  const updated = await roleRepository.updateRole(id, roleData);

  await auditLogServices.recordActivity({
    user: userId,
    action: "role.updated",
    module: "roles",
    targetId: id,
    description: `Role "${role.name}" was updated`,
  });

  return updated;
};

const deleteRole = async (id, userId) => {
  const role = await roleRepository.getRoleById(id);

  if (!role) {
    throw new ErrorHandler("Role not found", 404);
  }

  await roleRepository.deleteRole(id);

  await auditLogServices.recordActivity({
    user: userId,
    action: "role.deleted",
    module: "roles",
    targetId: id,
    description: `Role "${role.name}" was removed`,
  });
};

export default { createRole, getRoleById, getAllRoles, updateRole, deleteRole };
