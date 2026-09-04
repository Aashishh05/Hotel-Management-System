import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import restaurantOrderServices from "../services/resturantOrderServices.js";

export const createOrder = asyncErrorHandler(async (req, res) => {
  const order = await restaurantOrderServices.createOrder(
    req.body,
    req.user._id,
  );

  res.status(201).json({
    success: true,
    message: "Restaurant order created successfully",
    order,
  });
});

export const getAllOrders = asyncErrorHandler(async (req, res) => {
  const orders = await restaurantOrderServices.getAllOrders();

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getOrderById = asyncErrorHandler(async (req, res) => {
  const order = await restaurantOrderServices.getOrderById(req.params.id);

  res.status(200).json({
    success: true,
    order,
  });
});

export const getOrdersByGuest = asyncErrorHandler(async (req, res) => {
  const orders = await restaurantOrderServices.getOrdersByGuest(
    req.params.guestId,
  );

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getOrdersByRoom = asyncErrorHandler(async (req, res) => {
  const orders = await restaurantOrderServices.getOrdersByRoom(
    req.params.roomId,
  );

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getOrdersByStatus = asyncErrorHandler(async (req, res) => {
  const orders = await restaurantOrderServices.getOrdersByStatus(
    req.params.status,
  );

  res.status(200).json({
    success: true,
    orders,
  });
});

export const updateOrder = asyncErrorHandler(async (req, res) => {
  const order = await restaurantOrderServices.updateOrder(
    req.params.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Restaurant order updated successfully",
    order,
  });
});

export const deleteOrder = asyncErrorHandler(async (req, res) => {
  await restaurantOrderServices.deleteOrder(req.params.id);

  res.status(200).json({
    success: true,
    message: "Restaurant order deleted successfully",
  });
});
