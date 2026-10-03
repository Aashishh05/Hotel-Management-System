import roomRepository from "../repository/roomRepository.js";
import Booking from "../../booking/model/bookingModel.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import auditLogServices from "../../auditlog/services/auditLogServices.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../../utils/cloudinaryUpload.js";

const roomLabel = (room) => `Room ${room?.number || ""}`.trim();

const createRoom = async (roomData, files, userId) => {
  let images = [];

  if (files && files.length > 0) {
    const uploadResults = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer)),
    );

    images = uploadResults.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }));
  }

  const room = await roomRepository.createRoom({
    ...roomData,
    images,
  });

  await auditLogServices.recordActivity({
    user: userId,
    action: "room.created",
    module: "rooms",
    targetId: room._id,
    description: `${roomLabel(room)} was added`,
  });

  return room;
};

const getAllRooms = async (options = {}) => {
  const { page, limit } = options;
  if (page && limit) {
    return await roomRepository.getAllRoomsWithPagination({ page, limit });
  }
  return await roomRepository.getAllRooms();
};

const getRoomById = async (id) => {
  const room = await roomRepository.getRoomById(id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  return room;
};

const getRoomsByStatus = async (status) => {
  const validStatus = [
    "available",
    "occupied",
    "maintenance",
    "cleaning",
    "reserved",
  ];

  if (!validStatus.includes(status)) {
    throw new ErrorHandler("Invalid room status", 400);
  }

  return await roomRepository.getRoomsByStatus(status);
};

const getAvailableRooms = async () => {
  return await roomRepository.getAvailableRooms();
};

const getRoomAvailability = async ({ checkIn, checkOut }) => {
  if (!checkIn || !checkOut) {
    throw new ErrorHandler(
      "checkIn and checkOut query params are required",
      400,
    );
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime())
  ) {
    throw new ErrorHandler("Invalid date format", 400);
  }

  if (checkInDate >= checkOutDate) {
    throw new ErrorHandler("checkIn must be before checkOut", 400);
  }

  const rooms = await roomRepository.getAllRooms();

  const bookedRoomIds = await Booking.find({
    status: { $nin: ["cancelled", "checked-out"] },
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
  }).distinct("room");

  const bookedSet = new Set(bookedRoomIds.map(String));

  return rooms.map((room) => ({
    _id: room._id,
    number: room.number,
    type: room.type,
    pricePerNight: room.pricePerNight,
    status: room.status,
    availability: bookedSet.has(String(room._id)) ? "booked" : "available",
  }));
};

const updateRoom = async (id, roomData, files, userId) => {
  const room = await roomRepository.getRoomById(id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  if (roomData.number && roomData.number !== room.number) {
    const existingRoom = await roomRepository.getRoomByNumber(roomData.number);

    if (existingRoom) {
      throw new ErrorHandler("Room number already exists", 400);
    }
  }

  let images = room.images || [];

  if (files && files.length > 0) {
    if (room.images && room.images.length > 0) {
      await Promise.all(
        room.images.map((image) => deleteFromCloudinary(image.publicId)),
      );
    }

    const uploadResults = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer)),
    );

    images = uploadResults.map((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
    }));
  }

  const updated = await roomRepository.updateRoom(id, {
    ...roomData,
    images,
  });

  await auditLogServices.recordActivity({
    user: userId,
    action: "room.updated",
    module: "rooms",
    targetId: id,
    description: `${roomLabel(room)} was updated${
      roomData.status ? ` to ${roomData.status}` : ""
    }`,
  });

  return updated;
};

const deleteRoom = async (id, userId) => {
  const room = await roomRepository.getRoomById(id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  if (room.status === "occupied") {
    throw new ErrorHandler("Occupied room cannot be deleted", 400);
  }

  if (room.images && room.images.length > 0) {
    await Promise.all(
      room.images.map((image) => deleteFromCloudinary(image.publicId)),
    );
  }

  await roomRepository.deleteRoom(id);

  await auditLogServices.recordActivity({
    user: userId,
    action: "room.deleted",
    module: "rooms",
    targetId: id,
    description: `${roomLabel(room)} was removed`,
  });
};

export default {
  createRoom,
  getAllRooms,
  getRoomById,
  getRoomsByStatus,
  getAvailableRooms,
  getRoomAvailability,
  updateRoom,
  deleteRoom,
};
