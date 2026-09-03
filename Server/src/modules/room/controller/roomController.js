import roomServices from "../services/roomServices.js";
import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";

export const createRoom = asyncErrorHandler(async (req, res) => {
  const room = await roomServices.createRoom(req.body);

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    room,
  });
});

export const getAllRooms = asyncErrorHandler(async (req, res) => {
  const rooms = await roomServices.getAllRooms();

  res.status(200).json({
    success: true,
    rooms,
  });
});

export const getRoomById = asyncErrorHandler(async (req, res) => {
  const room = await roomServices.getRoomById(req.params.id);

  res.status(200).json({
    success: true,
    room,
  });
});

export const getRoomsByStatus = asyncErrorHandler(async (req, res) => {
  const rooms = await roomServices.getRoomsByStatus(req.params.status);

  res.status(200).json({
    success: true,
    rooms,
  });
});

export const getAvailableRooms = asyncErrorHandler(async (req, res) => {
  const rooms = await roomServices.getAvailableRooms();

  res.status(200).json({
    success: true,
    rooms,
  });
});

export const updateRoom = asyncErrorHandler(async (req, res) => {
  const room = await roomServices.updateRoom(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Room updated successfully",
    room,
  });
});

export const deleteRoom = asyncErrorHandler(async (req, res) => {
  await roomServices.deleteRoom(req.params.id);

  res.status(200).json({
    success: true,
    message: "Room deleted successfully",
  });
});
