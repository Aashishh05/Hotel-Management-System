
import Room from "../model/roomModel.js";
const createRoom = async (roomData) => {
  return await Room.create(roomData);
};

const getAllRooms = async () => {
  return await Room.find();
};

const getRoomById = async (id) => {
  return await Room.findById(id);
};

const getRoomByNumber = async (roomNumber) => {
  return await Room.findOne({ roomNumber });
};

const getRoomsByStatus = async (status) => {
  return await Room.find({ status });
};

const getAvailableRooms = async () => {
  return await Room.find({ status: "available" });
};

const updateRoom = async (id, roomData) => {
  return await Room.findByIdAndUpdate(
    id,
    roomData,
    {
      new: true,
      runValidators: true,
    }
  );
};

const deleteRoom = async (id) => {
  return await Room.findByIdAndDelete(id);
};

export default {
  createRoom,
  getAllRooms,
  getRoomById,
  getRoomByNumber,
  getRoomsByStatus,
  getAvailableRooms,
  updateRoom,
  deleteRoom,
};
