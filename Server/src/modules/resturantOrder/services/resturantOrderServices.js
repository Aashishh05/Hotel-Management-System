import guestRepository from "../../guest/repository/guestRepository.js";
import roomRepository from "../../room/repository/roomRepository.js";
import userRepository from "../../user/repository/userRepository.js";
import menuRepository from "../../menu/repository/menuRepository.js";
import bookingRepository from "../../booking/repository/bookingRepository.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import restaurantOrderRepository from "../repository/resturantOrderRepository.js"

const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

const getOwnGuest = async (userId) => {
  const user = await userRepository.getUserById(userId);

  if (!user?.email) {
    throw new ErrorHandler("Guest account not found", 404);
  }

  const guest = await guestRepository.getGuestByEmail(user.email);

  if (!guest) {
    throw new ErrorHandler("Guest account not found", 404);
  }

  return guest;
};

const getMyOrders = async (userId) => {
  const guest = await getOwnGuest(userId);

  return await restaurantOrderRepository.getOrdersByGuest(guest._id);
};

const getMyOrderById = async (orderId, userId) => {
  const guest = await getOwnGuest(userId);

  const order = await restaurantOrderRepository.getOrderById(orderId);

  if (!order || order.guest?._id?.toString() !== guest._id.toString()) {
    throw new ErrorHandler("Order not found", 404);
  }

  return order;
};

const createMyOrder = async (orderData, userId) => {
  const { items } = orderData;

  const guest = await getOwnGuest(userId);

  const booking = await bookingRepository.findActiveGuestBooking(guest._id);

  if (!booking) {
    throw new ErrorHandler(
      "No active stay. You can only order while staying at the hotel.",
      400,
    );
  }

  if (!items || items.length === 0) {
    throw new ErrorHandler("Order must contain at least one item", 400);
  }

  const orderItems = [];

  for (const item of items) {
    const menuItem = await menuRepository.getMenuItemById(item.menuItem);

    if (!menuItem) {
      throw new ErrorHandler("Menu item not found", 404);
    }

    if (!menuItem.isAvailable) {
      throw new ErrorHandler(`${menuItem.name} is not available`, 400);
    }

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new ErrorHandler("Quantity must be at least 1", 400);
    }

    orderItems.push({
      menuItem: menuItem._id,
      quantity,
      price: menuItem.price,
    });
  }

  const totalAmount = calculateTotal(orderItems);

  const order = await restaurantOrderRepository.createOrder({
    guest: guest._id,
    room: booking.room._id,
    items: orderItems,
    totalAmount,
    takenBy: userId,
  });

  return await restaurantOrderRepository.getOrderById(order._id);
};

const createOrder = async (orderData, userId) => {
  const { guest, room, items } = orderData;

  // Check guest
  const existingGuest = await guestRepository.getGuestById(guest);

  if (!existingGuest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  // Check room
  const existingRoom = await roomRepository.getRoomById(room);

  if (!existingRoom) {
    throw new ErrorHandler("Room not found", 404);
  }

  // Check items
  if (!items || items.length === 0) {
    throw new ErrorHandler("Order must contain at least one item", 400);
  }

  // Calculate total
  const totalAmount = calculateTotal(items);

  const order = await restaurantOrderRepository.createOrder({
    guest,
    room,
    items,
    totalAmount,
    takenBy: userId,
  });

  return order;
};

const getAllOrders = async () => {
  return await restaurantOrderRepository.getAllOrders();
};

const getOrderById = async (id) => {
  const order = await restaurantOrderRepository.getOrderById(id);

  if (!order) {
    throw new ErrorHandler("Restaurant order not found", 404);
  }

  return order;
};

const getOrdersByGuest = async (guestId) => {
  const guest = await guestRepository.getGuestById(guestId);

  if (!guest) {
    throw new ErrorHandler("Guest not found", 404);
  }

  return await restaurantOrderRepository.getOrdersByGuest(guestId);
};

const getOrdersByRoom = async (roomId) => {
  const room = await roomRepository.getRoomById(roomId);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  return await restaurantOrderRepository.getOrdersByRoom(roomId);
};

const getOrdersByStatus = async (status) => {
  const allowedStatuses = ["pending", "preparing", "served", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    throw new ErrorHandler("Invalid restaurant order status", 400);
  }

  return await restaurantOrderRepository.getOrdersByStatus(status);
};

const updateOrder = async (id, orderData) => {
  const order = await restaurantOrderRepository.getOrderById(id);

  if (!order) {
    throw new ErrorHandler("Restaurant order not found", 404);
  }

  // Don't allow changing the guest after creation
  if (
    orderData.guest &&
    orderData.guest.toString() !== order.guest._id.toString()
  ) {
    throw new ErrorHandler("Order guest cannot be changed", 400);
  }

  // Don't allow changing the room after creation
  if (
    orderData.room &&
    orderData.room.toString() !== order.room._id.toString()
  ) {
    throw new ErrorHandler("Order room cannot be changed", 400);
  }

  // Recalculate total if items are updated
  if (orderData.items) {
    if (orderData.items.length === 0) {
      throw new ErrorHandler("Order must contain at least one item", 400);
    }

    orderData.totalAmount = calculateTotal(orderData.items);
  }

  const updatedOrder = await restaurantOrderRepository.updateOrder(
    id,
    orderData,
  );

  return updatedOrder;
};

const deleteOrder = async (id) => {
  const order = await restaurantOrderRepository.getOrderById(id);

  if (!order) {
    throw new ErrorHandler("Restaurant order not found", 404);
  }

  if (order.status === "served") {
    throw new ErrorHandler("Served orders cannot be deleted", 400);
  }

  return await restaurantOrderRepository.deleteOrder(id);
};

export default {
  createOrder,
  createMyOrder,
  getMyOrderById,
  getMyOrders,
  getAllOrders,
  getOrderById,
  getOrdersByGuest,
  getOrdersByRoom,
  getOrdersByStatus,
  updateOrder,
  deleteOrder,
};
