import RestaurantOrder from "../model/resturantOrderModel.js";

const createOrder = async (orderData) => {
  return await RestaurantOrder.create(orderData);
};

const getAllOrders = async () => {
  return await RestaurantOrder.find()
    .populate("guest")
    .populate("room")
    .populate("items.menuItem")
    .populate("takenBy")
    .sort({ createdAt: -1 });
};

const getOrderById = async (id) => {
  return await RestaurantOrder.findById(id)
    .populate("guest")
    .populate("room")
    .populate("items.menuItem")
    .populate("takenBy");
};

const getOrdersByGuest = async (guestId) => {
  return await RestaurantOrder.find({ guest: guestId })
    .populate("guest")
    .populate("room")
    .populate("items.menuItem")
    .populate("takenBy")
    .sort({ createdAt: -1 });
};

const getOrdersByRoom = async (roomId) => {
  return await RestaurantOrder.find({ room: roomId })
    .populate("guest")
    .populate("room")
    .populate("items.menuItem")
    .populate("takenBy")
    .sort({ createdAt: -1 });
};

const getOrdersByStatus = async (status) => {
  return await RestaurantOrder.find({ status })
    .populate("guest")
    .populate("room")
    .populate("items.menuItem")
    .populate("takenBy")
    .sort({ createdAt: -1 });
};

const updateOrder = async (id, orderData) => {
  return await RestaurantOrder.findByIdAndUpdate(id, orderData, {
    new: true,
    runValidators: true,
  })
    .populate("guest")
    .populate("room")
    .populate("items.menuItem")
    .populate("takenBy");
};

const deleteOrder = async (id) => {
  return await RestaurantOrder.findByIdAndDelete(id);
};

export default {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByGuest,
  getOrdersByRoom,
  getOrdersByStatus,
  updateOrder,
  deleteOrder,
};
