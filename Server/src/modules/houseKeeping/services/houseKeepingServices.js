import roomRepository from "../../room/repository/roomRepository.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import userRepository from "../../user/repository/userRepository.js";
import houseKeepingRepository from "../repository/houseKeepingRepository.js";
import auditLogServices from "../../auditlog/services/auditLogServices.js";

const createTask = async (taskData, userId) => {
  const { room, assignedTo, type, status, notes, scheduledAt } = taskData;

  const existingRoom = await roomRepository.getRoomById(room);

  if (!existingRoom) {
    throw new ErrorHandler("Room not", 404);
  }

  if (assignedTo) {
    const user = await userRepository.getUserById(assignedTo);

    if (!user) {
      throw new ErrorHandler("Assigned User not found", 404);
    }
  }

  const created = await houseKeepingRepository.createTask({
    room,
    assignedTo: assignedTo || null,
    type,
    status,
    notes,
    scheduledAt,
  });

  await auditLogServices.recordActivity({
    user: userId,
    action: "housekeeping.task_created",
    module: "housekeeping",
    targetId: created._id,
    description: `${type || "Housekeeping"} task was created`,
  });

  return created;
};

const getAllTasks = async () => {
  return await houseKeepingRepository.getAllTasks();
};

const getTaskById = async (id) => {
  const task = await houseKeepingRepository.getTaskById(id);

  if (!task) {
    throw new ErrorHandler("HouseKeeping task not found", 404);
  }

  return task;
};

const getTasksByRoom = async (roomId) => {
  const room = await roomRepository.getRoomById(roomId);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  return await houseKeepingRepository.getTasksByRoom(roomId);
};

const getTasksByEmployee = async (employeeId) => {
  const user = await userRepository.getUserById(employeeId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return await houseKeepingRepository.getTasksByEmployee(employeeId);
};

const getTasksByStatus = async (status) => {
  const allowedStatuses = ["pending", "in-progress", "done"];

  if (!allowedStatuses.includes(status)) {
    throw new ErrorHandler("Invalid housekeeping task status", 400);
  }

  return await houseKeepingRepository.getTasksByStatus(status);
};

const updateTask = async (id, taskData, userId) => {
  const task = await houseKeepingRepository.getTaskById(id);

  if (!task) {
    throw new ErrorHandler("Housekeeping task not found", 404);
  }

  if (taskData.room) {
    const room = await roomRepository.getRoomById(taskData.room);

    if (!room) {
      throw new ErrorHandler("Room not found", 404);
    }
  }

  if (taskData.assignedTo) {
    const user = await userRepository.getUserById(taskData.assignedTo);

    if (!user) {
      throw new ErrorHandler("Assigned user not found", 404);
    }
  }

  const updated = await houseKeepingRepository.updateTask(id, taskData);

  await auditLogServices.recordActivity({
    user: userId,
    action: "housekeeping.task_updated",
    module: "housekeeping",
    targetId: id,
    description: `${task.type || "Housekeeping"} task was updated${
      taskData.status ? ` to ${taskData.status}` : ""
    }`,
  });

  return updated;
};

const deleteTask = async (id, userId) => {
  const task = await houseKeepingRepository.getTaskById(id);

  if (!task) {
    throw new ErrorHandler("Housekeeping task not found", 404);
  }

  if (task.status === "in-progress") {
    throw new ErrorHandler(
      "In-progress housekeeping tasks cannot be deleted",
      400,
    );
  }

  await houseKeepingRepository.deleteTask(id);

  await auditLogServices.recordActivity({
    user: userId,
    action: "housekeeping.task_deleted",
    module: "housekeeping",
    targetId: id,
    description: `${task.type || "Housekeeping"} task was removed`,
  });
};

const startTask = async (id, userId) => {
  const task = await houseKeepingRepository.getTaskById(id);

  if (!task) {
    throw new ErrorHandler("Housekeeping task not found", 404);
  }

  if (task.status !== "pending") {
    throw new ErrorHandler("Only pending tasks can be started", 400);
  }

  const room = await roomRepository.getRoomById(task.room._id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  if (room.status !== "cleaning") {
    throw new ErrorHandler("Room is not currently marked for cleaning", 400);
  }

  const started = await houseKeepingRepository.updateTask(id, {
    status: "in-progress",
    startedAt: new Date(),
  });

  await auditLogServices.recordActivity({
    user: userId,
    action: "housekeeping.task_started",
    module: "housekeeping",
    targetId: id,
    description: `${task.type || "Housekeeping"} task was started`,
  });

  return started;
};

const completeTask = async (id, userId) => {
  const task = await houseKeepingRepository.getTaskById(id);

  if (!task) {
    throw new ErrorHandler("Housekeeping task not found", 404);
  }

  if (task.status !== "in-progress") {
    throw new ErrorHandler("Only in-progress tasks can be completed", 400);
  }

  const room = await roomRepository.getRoomById(task.room._id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  const updatedTask = await houseKeepingRepository.updateTask(id, {
    status: "done",
    completedAt: new Date(),
  });

  await roomRepository.updateRoom(task.room._id, {
    status: "available",
  });

  await auditLogServices.recordActivity({
    user: userId,
    action: "housekeeping.task_completed",
    module: "housekeeping",
    targetId: id,
    description: `${task.type || "Housekeeping"} task was completed`,
  });

  return updatedTask;
};

export default {
  createTask,
  getAllTasks,
  getTaskById,
  getTasksByRoom,
  getTasksByEmployee,
  getTasksByStatus,
  updateTask,
  deleteTask,
  startTask,
  completeTask,
};
