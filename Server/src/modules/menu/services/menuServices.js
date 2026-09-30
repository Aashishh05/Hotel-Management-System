import ErrorHandler from "../../../utils/ErrorHandler.js";
import menuRepository from "../repository/menuRepository.js"
import auditLogServices from "../../auditlog/services/auditLogServices.js";

const createMenuItem = async (menuItemData, userId) => {
  const menuItem = await menuRepository.createMenuItem(menuItemData);

  await auditLogServices.recordActivity({
    user: userId,
    action: "menu.item_created",
    module: "menu",
    targetId: menuItem._id,
    description: `Menu item "${menuItem.name}" was added`,
  });

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

const updateMenuItem = async (id, menuItemData, userId) => {
  const menuItem = await menuRepository.getMenuItemById(id);

  if (!menuItem) {
    throw new ErrorHandler("Menu item not found", 404);
  }

  const updated = await menuRepository.updateMenuItem(id, menuItemData);

  await auditLogServices.recordActivity({
    user: userId,
    action: "menu.item_updated",
    module: "menu",
    targetId: id,
    description: `Menu item "${menuItem.name}" was updated`,
  });

  return updated;
};

const deleteMenuItem = async (id, userId) => {
  const menuItem = await menuRepository.getMenuItemById(id);

  if (!menuItem) {
    throw new ErrorHandler("Menu item not found", 404);
  }

  await menuRepository.deleteMenuItem(id);

  await auditLogServices.recordActivity({
    user: userId,
    action: "menu.item_deleted",
    module: "menu",
    targetId: id,
    description: `Menu item "${menuItem.name}" was removed`,
  });
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
