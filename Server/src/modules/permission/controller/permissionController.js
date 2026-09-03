import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import permissionServices from "../services/permissionServices.js";

export const createPermission = asyncErrorHandler(async (req, res) => {
  const permission = await permissionServices.createPermission(req.body);

  res.status(201).json({
    success: false,
    message: "Permission created successfully",
    permission,
  });
});
export const getAllPermissions = asyncErrorHandler(async (req, res) => {
  const permissions = await permissionServices.getAllPermissions();

  res.status(200).json({
    success: true,
    permissions,
  });
});

export const getPermissionById = asyncErrorHandler(async (req, res) => {
  const permission = await permissionServices.getPermissionById(req.params.id);
  res.status(200).json({
    success: true,
    permission,
  });
});
export const getPermissionByRole = asyncErrorHandler(async (req, res) => {
  const permission = await permissionServices.getPermissionByRole(
    req.params.roleId,
  );
  res.status(200).json({
    success: true,
    permission,
  });
});
export const updatePermissionByRole = asyncErrorHandler(async (req, res) => {
  const permission = await permissionServices.updatePermissionByRole(
    req.params.roleId,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: "Permission updated successfully",
    permission,
  });
});
export const deletePermissionByRole = asyncErrorHandler(async (req, res) => {
  await permissionServices.deletePermissionByRole(req.params.roleId);
  res.status(200).json({
    success: true,
    message: "Permission deleted successfully",
  });
});
export const getMyPermissions = asyncErrorHandler(async (req, res) => {
  const permission = await permissionServices.getMyPermissions(req.user.role);
  res.status(200).json({
    success: true,
    permission,
  });
});
