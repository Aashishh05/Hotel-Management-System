import MenuItem from "../model/menuModel.js";

const createMenuItem = async (menuItemData) => {
  return await MenuItem.create(menuItemData);
};

const getAllMenuItems = async () => {
  return await MenuItem.find().sort({ createdAt: -1 });
};

const getMenuItemById = async (id) => {
  return await MenuItem.findById(id);
};

const getMenuItemsByCategory = async (category) => {
  return await MenuItem.find({ category }).sort({
    createdAt: -1,
  });
};

const getAvailableMenuItems = async () => {
  return await MenuItem.find({
    isAvailable: true,
  }).sort({ createdAt: -1 });
};

const updateMenuItem = async (id, menuItemData) => {
  return await MenuItem.findByIdAndUpdate(id, menuItemData, {
    new: true,
    runValidators: true,
  });
};

const deleteMenuItem = async (id) => {
  return await MenuItem.findByIdAndDelete(id);
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
