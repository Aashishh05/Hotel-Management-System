import Room from "../model/roomModel.js";
const createRoom = async (roomData) => {
  return await Room.create(roomData);
};

const getAllRooms = async () => {
  return await Room.find();
};

const getAllRoomsWithPagination = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  const [rooms, total] = await Promise.all([
    Room.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    Room.countDocuments(),
  ]);
  return {
    rooms,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

const getRoomById = async (id) => {
  return await Room.findById(id);
};

const getRoomByNumber = async (number) => {
  return await Room.findOne({ number });
};

const getRoomsByStatus = async (status) => {
  return await Room.find({ status });
};

const getAvailableRooms = async () => {
  return await Room.find({ status: "available" });
};

const updateRoom = async (id, roomData) => {
  return await Room.findByIdAndUpdate(id, roomData, {
    new: true,
    runValidators: true,
  });
};

const deleteRoom = async (id) => {
  return await Room.findByIdAndDelete(id);
};

export default {
  createRoom,
  getAllRooms,
  getAllRoomsWithPagination,
  getRoomById,
  getRoomByNumber,
  getRoomsByStatus,
  getAvailableRooms,
  updateRoom,
  deleteRoom,
};
