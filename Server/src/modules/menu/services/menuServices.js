import ErrorHandler from "../../../utils/ErrorHandler.js";
import menuRepository from "../repository/menuRepository.js"

const createMenuItem = async (menuItemData) => {
  const menuItem = await menuRepository.createMenuItem(menuItemData);

  return menuItem;
};

const getAllMenuItems = async () => {
  return await menuRepository.getAllMenuItems();
};

const getMenuItemById = async (id) => {
  const menuItem = await menuRepository.getMenuItemById(id);

  if (!menuItem) {
    throw new ErrorHandler("Menu item not found", 404);
  }

  return menuItem;
};

const getMenuItemsByCategory = async (category) => {
  const allowedCategories = ["starter", "main", "dessert", "drinks", "snacks"];

  if (!allowedCategories.includes(category)) {
    throw new ErrorHandler("Invalid menu item category", 400);
  }

  return await menuRepository.getMenuItemsByCategory(category);
};

const getAvailableMenuItems = async () => {
  return await menuRepository.getAvailableMenuItems();
};

const updateMenuItem = async (id, menuItemData) => {
  const menuItem = await menuRepository.getMenuItemById(id);

  if (!menuItem) {
    throw new ErrorHandler("Menu item not found", 404);
  }

  return await menuRepository.updateMenuItem(id, menuItemData);
};

const deleteMenuItem = async (id) => {
  const menuItem = await menuRepository.getMenuItemById(id);

  if (!menuItem) {
    throw new ErrorHandler("Menu item not found", 404);
  }

  return await menuRepository.deleteMenuItem(id);
};

export default {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  getMenuItemsByCategory,
  getAvailableMenuItems,
  updateMenuItem,
  deleteMenuItem,
};
