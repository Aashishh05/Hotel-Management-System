import Housekeeping from "../model/houseKeepingModel.js";

const createTask = async (taskData) => {
  return await Housekeeping.create(taskData);
};

const getAllTasks = async () => {
  return await Housekeeping.find().populate("room").populate("assignedTo");
};

const getTaskById = async (id) => {
  return await Housekeeping.findById(id)
    .populate("room")
    .populate("assignedTo");
};

const getTasksByRoom = async (roomId) => {
  return await Housekeeping.find({ room: roomId })
    .populate("room")
    .populate("assignedTo");
};

const getTasksByEmployee = async (employeeId) => {
  return await Housekeeping.find({ assignedTo: employeeId })
    .populate("room")
    .populate("assignedTo");
};

const getTasksByStatus = async (status) => {
  return await Housekeeping.find({ status })
    .populate("room")
    .populate("assignedTo");
};

const updateTask = async (id, taskData) => {
  return await Housekeeping.findByIdAndUpdate(id, taskData, {
    new: true,
    runValidators: true,
  })
    .populate("room")
    .populate("assignedTo");
};

const deleteTask = async (id) => {
  return await Housekeeping.findByIdAndDelete(id);
};

export default {
  createTask,
  getAllTasks,
  getTaskById,
  getTasksByEmployee,
  getTasksByRoom,
  getTasksByStatus,
  updateTask,
  deleteTask,
};
