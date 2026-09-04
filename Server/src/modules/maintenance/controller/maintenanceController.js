import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import maintenanceServices from "../services/maintenanceServices.js";

export const createRequest = asyncErrorHandler(async (req, res) => {
  const request = await maintenanceServices.createRequest(
    req.body,
    req.user._id,
  );

  res.status(201).json({
    success: true,
    message: "Maintenance request created successfully",
    request,
  });
});

export const getAllRequests = asyncErrorHandler(async (req, res) => {
  const requests = await maintenanceServices.getAllRequests();

  res.status(200).json({
    success: true,
    requests,
  });
});

export const getRequestById = asyncErrorHandler(async (req, res) => {
  const request = await maintenanceServices.getRequestById(req.params.id);

  res.status(200).json({
    success: true,
    request,
  });
});

export const getRequestsByRoom = asyncErrorHandler(async (req, res) => {
  const requests = await maintenanceServices.getRequestsByRoom(
    req.params.roomId,
  );

  res.status(200).json({
    success: true,
    requests,
  });
});

export const getRequestsByEmployee = asyncErrorHandler(async (req, res) => {
  const requests = await maintenanceServices.getRequestsByEmployee(
    req.params.employeeId,
  );

  res.status(200).json({
    success: true,
    requests,
  });
});

export const getRequestsByStatus = asyncErrorHandler(async (req, res) => {
  const requests = await maintenanceServices.getRequestsByStatus(
    req.params.status,
  );

  res.status(200).json({
    success: true,
    requests,
  });
});

export const getRequestsByPriority = asyncErrorHandler(async (req, res) => {
  const requests = await maintenanceServices.getRequestsByPriority(
    req.params.priority,
  );

  res.status(200).json({
    success: true,
    requests,
  });
});

export const updateRequest = asyncErrorHandler(async (req, res) => {
  const request = await maintenanceServices.updateRequest(
    req.params.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Maintenance request updated successfully",
    request,
  });
});

export const deleteRequest = asyncErrorHandler(async (req, res) => {
  await maintenanceServices.deleteRequest(req.params.id);

  res.status(200).json({
    success: true,
    message: "Maintenance request deleted successfully",
  });
});
