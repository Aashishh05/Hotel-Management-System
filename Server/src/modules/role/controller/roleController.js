import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import roleService from "../services/roleService.js";

export const createRole = asyncErrorHandler(async (req, res) => {
  const role = await roleService.createRole(req.body);

  res.status(201).json({
    success: true,
    message: "Role created successfully",
    role,
  });
});

export const getAllRoles = asyncErrorHandler(async (req, res) => {
  const roles = await roleService.getAllRoles();

  res.status(200).json({ success: true, roles });
});

export const getRoleById = asyncErrorHandler(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);

  res.status(200).json({ success: true, role });
});

export const updateRole = asyncErrorHandler(async (req, res) => {
  const role = await roleService.updateRole(req.params.id, req.body);

  res
    .status(201)
    .json({ success: true, message: "Role updated successfully", role });
});

export const deleteRole = asyncErrorHandler(async (req, res) => {
  await roleService.deleteRole(req.params.id);

  res
    .status(200)
    .json({ success: true, message: "Role deleted Successfully  " });
});
