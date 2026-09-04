import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import menuServices from "../services/menuServices.js";

export const createMenuItem = asyncErrorHandler(async (req, res) => {
  const menuItem = await menuServices.createMenuItem(req.body);

  res.status(201).json({
    success: true,
    message: "Menu item created successfully",
    menuItem,
  });
});

export const getAllMenuItems = asyncErrorHandler(async (req, res) => {
  const menuItems = await menuServices.getAllMenuItems();

  res.status(200).json({
    success: true,
    menuItems,
  });
});

export const getMenuItemById = asyncErrorHandler(async (req, res) => {
  const menuItem = await menuServices.getMenuItemById(req.params.id);

  res.status(200).json({
    success: true,
    menuItem,
  });
});

export const getMenuItemsByCategory = asyncErrorHandler(async (req, res) => {
  const menuItems = await menuServices.getMenuItemsByCategory(
    req.params.category,
  );

  res.status(200).json({
    success: true,
    menuItems,
  });
});

export const getAvailableMenuItems = asyncErrorHandler(async (req, res) => {
  const menuItems = await menuServices.getAvailableMenuItems();

  res.status(200).json({
    success: true,
    menuItems,
  });
});

export const updateMenuItem = asyncErrorHandler(async (req, res) => {
  const menuItem = await menuServices.updateMenuItem(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Menu item updated successfully",
    menuItem,
  });
});

export const deleteMenuItem = asyncErrorHandler(async (req, res) => {
  await menuServices.deleteMenuItem(req.params.id);

  res.status(200).json({
    success: true,
    message: "Menu item deleted successfully",
  });
});
