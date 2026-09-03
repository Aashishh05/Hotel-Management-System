import roomRepository from "../repository/roomRepository.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";

const createRoom = async (roomData) => {
  const { roomNumber } = roomData;

  const existingRoom = await roomRepository.getRoomByNumber(roomNumber);

  if (existingRoom) {
    throw new ErrorHandler("Room number already exists", 400);
  }

  return await roomRepository.createRoom(roomData);
};

const getAllRooms = async () => {
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

const updateRoom = async (id, roomData) => {
  const room = await roomRepository.getRoomById(id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  if (roomData.roomNumber && roomData.roomNumber !== room.roomNumber) {
    const existingRoom = await roomRepository.getRoomByNumber(
      roomData.roomNumber,
    );

    if (existingRoom) {
      throw new ErrorHandler("Room number already exists", 400);
    }
  }

  return await roomRepository.updateRoom(id, roomData);
};

const deleteRoom = async (id) => {
  const room = await roomRepository.getRoomById(id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  if (room.status === "occupied") {
    throw new ErrorHandler("Occupied room cannot be deleted", 400);
  }

  return await roomRepository.deleteRoom(id);
};

export default {
  createRoom,
  getAllRooms,
  getRoomById,
  getRoomsByStatus,
  getAvailableRooms,
  updateRoom,
  deleteRoom,
};
