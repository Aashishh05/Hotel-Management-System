import roomRepository from "../../../modules/room/repository/roomRepository.js";
import userRepository from "../../../modules/user/repository/userRepository.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import maintenanceRepository from "../repository/maintenanceRepository.js";

const createRequest = async (requestData, userId) => {
  const { room, reportedBy, assignedTo, issue, priority, status } = requestData;

  if (room) {
    const existingRoom = await roomRepository.getRoomById(room);

    if (!existingRoom) {
      throw new ErrorHandler("Room not found", 404);
    }
  }

  const reporterId = reportedBy || userId;

  if (reporterId) {
    const user = await userRepository.getUserById(reporterId);

    if (!user) {
      throw new ErrorHandler("Reported user not found", 404);
    }
  }

  if (assignedTo) {
    const user = await userRepository.getUserById(assignedTo);

    if (!user) {
      throw new ErrorHandler("Assigned user not found", 404);
    }
  }

  return await maintenanceRepository.createRequest({
    room: room || null,
    reportedBy: reporterId || null,
    assignedTo: assignedTo || null,
    issue,
    priority,
    status,
  });
};

const getAllRequests = async () => {
  return await maintenanceRepository.getAllRequests();
};

const getRequestById = async (id) => {
  const request = await maintenanceRepository.getRequestById(id);

  if (!request) {
    throw new ErrorHandler("Maintenance request not found", 404);
  }

  return request;
};

const getRequestsByRoom = async (roomId) => {
  const room = await roomRepository.getRoomById(roomId);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  return await maintenanceRepository.getRequestsByRoom(roomId);
};

const getRequestsByEmployee = async (employeeId) => {
  const user = await userRepository.getUserById(employeeId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return await maintenanceRepository.getRequestsByEmployee(employeeId);
};

const getRequestsByStatus = async (status) => {
  const allowedStatuses = ["open", "in-progress", "resolved", "closed"];

  if (!allowedStatuses.includes(status)) {
    throw new ErrorHandler("Invalid maintenance request status", 400);
  }

  return await maintenanceRepository.getRequestsByStatus(status);
};

const getRequestsByPriority = async (priority) => {
  const allowedPriorities = ["low", "medium", "high", "urgent"];

  if (!allowedPriorities.includes(priority)) {
    throw new ErrorHandler("Invalid maintenance priority", 400);
  }

  return await maintenanceRepository.getRequestsByPriority(priority);
};

const updateRequest = async (id, requestData) => {
  const request = await maintenanceRepository.getRequestById(id);

  if (!request) {
    throw new ErrorHandler("Maintenance request not found", 404);
  }

  if (requestData.room) {
    const room = await roomRepository.getRoomById(requestData.room);

    if (!room) {
      throw new ErrorHandler("Room not found", 404);
    }
  }

  if (requestData.reportedBy) {
    const user = await userRepository.getUserById(requestData.reportedBy);

    if (!user) {
      throw new ErrorHandler("Reported user not found", 404);
    }
  }

  if (requestData.assignedTo) {
    const user = await userRepository.getUserById(requestData.assignedTo);

    if (!user) {
      throw new ErrorHandler("Assigned user not found", 404);
    }
  }

  return await maintenanceRepository.updateRequest(id, requestData);
};

const deleteRequest = async (id) => {
  const request = await maintenanceRepository.getRequestById(id);

  if (!request) {
    throw new ErrorHandler("Maintenance request not found", 404);
  }

  if (request.status === "in-progress" || request.status === "resolved") {
    throw new ErrorHandler(
      "In-progress or resolved maintenance requests cannot be deleted",
      400,
    );
  }

  return await maintenanceRepository.deleteRequest(id);
};

export default {
  createRequest,
  getAllRequests,
  getRequestById,
  getRequestsByRoom,
  getRequestsByEmployee,
  getRequestsByStatus,
  getRequestsByPriority,
  updateRequest,
  deleteRequest,
};
