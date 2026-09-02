import User from "../../user/model/userModel.js";
import Role from "../../role/model/roleModel.js";

const findUserByEmail = async (email) => {
  return await User.findOne({ email }).populate("role", "name");
};

const findUserById = async (id) => {
  return await User.findById(id).populate("role", "name");
};

const findRoleByName = async (name) => {
  return await Role.findOne({ name });
};

const createUser = async (userData) => {
  return await User.create(userData);
};

export default {
  findUserByEmail,
  findUserById,
  findRoleByName,
  createUser,
};
