import houseKeepingServices from "../services/houseKeepingServices.js";
import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js"

export const createTask = asyncErrorHandler(async (req, res) => {
  const task = await houseKeepingServices.createTask(req.body);

  res.status(201).json({
    success: true,
    message: "Housekeeping task created successfully",
    task,
  });
});

export const getAllTasks = asyncErrorHandler(async (req, res) => {
  const tasks = await houseKeepingServices.getAllTasks();

  res.status(200).json({
    success: true,
    tasks,
  });
});

export const getTaskById = asyncErrorHandler(async (req, res) => {
  const task = await houseKeepingServices.getTaskById(req.params.id);

  res.status(200).json({
    success: true,
    task,
  });
});

export const getTasksByRoom = asyncErrorHandler(async (req, res) => {
  const tasks = await houseKeepingServices.getTasksByRoom(req.params.roomId);

  res.status(200).json({
    success: true,
    tasks,
  });
});

export const getTasksByEmployee = asyncErrorHandler(async (req, res) => {
  const tasks = await houseKeepingServices.getTasksByEmployee(
    req.params.employeeId,
  );

  res.status(200).json({
    success: true,
    tasks,
  });
});

export const getTasksByStatus = asyncErrorHandler(async (req, res) => {
  const tasks = await houseKeepingServices.getTasksByStatus(req.params.status);

  res.status(200).json({
    success: true,
    tasks,
  });
});

export const updateTask = asyncErrorHandler(async (req, res) => {
  const task = await houseKeepingServices.updateTask(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Housekeeping task updated successfully",
    task,
  });
});

export const deleteTask = asyncErrorHandler(async (req, res) => {
  await houseKeepingServices.deleteTask(req.params.id);

  res.status(200).json({
    success: true,
    message: "Housekeeping task deleted successfully",
  });
});

export const startTask = asyncErrorHandler(async (req, res) => {
  const task = await houseKeepingServices.startTask(req.params.id);

  res.status(200).json({
    success: true,
    message: "Housekeeping task started successfully",
    task,
  });
});

export const completeTask = asyncErrorHandler(async (req, res) => {
  const task = await houseKeepingServices.completeTask(req.params.id);

  res.status(200).json({
    success: true,
    message: "Housekeeping task completed successfully",
    task,
  });
});
