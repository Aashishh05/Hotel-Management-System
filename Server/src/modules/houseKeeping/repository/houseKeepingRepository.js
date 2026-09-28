import Housekeeping from "../model/houseKeepingModel.js";

const createTask = async (taskData) => {
  return await Housekeeping.create(taskData);
};

const populateRefs = [
  { path: "room" },
  { path: "assignedTo", select: "name email avatar" },
];

const getAllTasks = async () => {
  return await Housekeeping.find().populate(populateRefs);
};

const getTaskById = async (id) => {
  return await Housekeeping.findById(id).populate(populateRefs);
};

const getTasksByRoom = async (roomId) => {
  return await Housekeeping.find({ room: roomId }).populate(populateRefs);
};

const getTasksByEmployee = async (employeeId) => {
  return await Housekeeping.find({ assignedTo: employeeId }).populate(
    populateRefs,
  );
};

const getTasksByStatus = async (status) => {
  return await Housekeeping.find({ status }).populate(populateRefs);
};

const updateTask = async (id, taskData) => {
  return await Housekeeping.findByIdAndUpdate(id, taskData, {
    new: true,
    runValidators: true,
  }).populate(populateRefs);
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
