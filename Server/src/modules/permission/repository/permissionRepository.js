import Permission from "../model/permissionModel.js";

const createPermission = async (permissionData) => {
  return await Permission.create(permissionData);
};

const getAllPermission = async () => {
  return await Permission.find().populate("role", "name");
};

const getPermissionById = async (id) => {
  return await Permission.findById(id).populate("role", "name");
};

const getPermissionByRole = async (roleId) => {
  return await Permission.findOne({ role: roleId }).populate("role", "name");
};

const updatePermissionByRole = async (roleId, permissionData) => {
  return await Permission.findOneAndUpdate({ role: roleId }, permissionData, {
    new: true,
    runValidators: true,
  }).populate("role", "name");
};

const deletePermissionByRole = async (roleId) => {
  return await Permission.findOneAndDelete({ role: roleId });
};

export default {
  createPermission,
  getAllPermission,
  getPermissionById,
  getPermissionByRole,
  updatePermissionByRole,
  deletePermissionByRole,
};
