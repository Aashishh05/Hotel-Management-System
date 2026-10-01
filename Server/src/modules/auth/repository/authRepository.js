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

const saveResetToken = async (userId, token, expiry) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      resetPasswordToken: token,
      resetPasswordExpire: expiry,
    },
    { new: true },
  );
};

const findUserByResetToken = async (token) => {
  return await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });
};

const updatePassword = async (userId, hashedPassword) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    },
    { new: true },
  );
};

export default {
  findUserByEmail,
  findUserById,
  findRoleByName,
  createUser,
  saveResetToken,
  findUserByResetToken,
  updatePassword,
};
