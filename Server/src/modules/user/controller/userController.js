import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import userServices from "../services/userServices.js";

export const createUser = asyncErrorHandler(async (req, res) => {
  const user = await userServices.createUser(req.body);

  res.status(201).json({
    success: true,
    message: "User created Successfully",
    user,
  });
});

export const getAllUsers = asyncErrorHandler(async (req, res) => {
  const users = await userServices.getAllUsers();

  res.status(200).json({
    success: true,
    users,
  });
});

export const getUserById = asyncErrorHandler(async (req, res) => {
  const user = await userServices.getUserById(req.params.id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const getUsersByRole = asyncErrorHandler(async (req, res) => {
  const users = await userServices.getUsersByRole(req.params.roleId);

  res.status(200).json({
    success: true,
    users,
  });
});

export const updateUser = asyncErrorHandler(async (req, res) => {
  const user = await userServices.updateUser(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});

export const deleteUser = asyncErrorHandler(async (req, res) => {
  await userServices.deleteUser(req.params.id);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
