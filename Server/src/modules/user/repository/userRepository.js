import User from "../model/userModel.js";

const createUser = async (userData) => {
  return await User.create(userData);
};

const getAllUser = async () => {
  return await User.find().populate("role", "name");
};

const getUserById = async (id) => {
  return await User.findById(id).populate("role", "name");
};

const getUserByEmail = async (email) => {
  return await User.findOne({ email: email }).populate("role", "name");
};

const getUserByRole = async (roleId) => {
  return await User.findOne({ role: roleId }).populate("role", "name");
};

const updateUser = async (id, userData) => {
  return await User.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true,
  }).populate("role", "name");
};

const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

export default {
  createUser,
  getAllUser,
  getUserById,
  getUserByEmail,
  getUserByRole,
  updateUser,
  deleteUser,
};
