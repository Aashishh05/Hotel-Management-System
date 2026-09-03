import Role from "../model/roleModel.js";

const createRole = async (roleData) => {
  await Role.create(roleData);
};

const getAllRole = async () => {
  return await Role.find();
};

const getRoleById = async (id) => {
  return await Role.findById(id);
};

const getRoleByName = async (name) => {
  return await Role.findOne({ name });
};

const updateRole = async (id, roleData) => {
  return await Role.findByIdAndUpdate(id, roleData, {
    new: true,
    runValidators: true,
  });
};

const deleteRole = async (id) => {
  return Role.findByIdAndDelete(id);
};

export default {
  createRole,
  getAllRole,
  getRoleById,
  getRoleByName,
  updateRole,
  deleteRole,
};
