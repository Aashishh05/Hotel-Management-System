import roomRepository from "../../../modules/room/repository/roomRepository.js";
import userRepository from "../../../modules/user/repository/userRepository.js";
import guestRepository from "../../../modules/guest/repository/guestRepository.js";
import bookingRepository from "../../../modules/booking/repository/bookingRepository.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";
import maintenanceRepository from "../repository/maintenanceRepository.js";
import auditLogServices from "../../auditlog/services/auditLogServices.js";

const issueLabel = (request) =>
  `Maintenance request "${(request?.issue || "").trim().slice(0, 60)}"`;

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

  const created = await maintenanceRepository.createRequest({
    room: room || null,
    reportedBy: reporterId || null,
    assignedTo: assignedTo || null,
    issue,
    priority,
    status,
  });

  await auditLogServices.recordActivity({
    user: userId,
    action: "maintenance.reported",
    module: "maintenance",
    targetId: created._id,
    description: `${issueLabel(created)} was reported (${priority || "medium"})`,
  });

  return created;
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

const updateRequest = async (id, requestData, userId) => {
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

  const updated = await maintenanceRepository.updateRequest(id, requestData);

  await auditLogServices.recordActivity({
    user: userId,
    action: "maintenance.updated",
    module: "maintenance",
    targetId: id,
    description: `${issueLabel(request)} was updated${
      requestData.status ? ` to ${requestData.status}` : ""
    }`,
  });

  return updated;
};

const deleteRequest = async (id, userId) => {
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

  await maintenanceRepository.deleteRequest(id);

  await auditLogServices.recordActivity({
    user: userId,
    action: "maintenance.deleted",
    module: "maintenance",
    targetId: id,
    description: `${issueLabel(request)} was removed`,
  });
};

const hasActiveBookingForRoom = async (userId, roomId) => {
  const user = await userRepository.getUserById(userId);

  if (!user?.email) return false;

  const guest = await guestRepository.getGuestByEmail(user.email);

  if (!guest) return false;

  const booking = await bookingRepository.findActiveGuestRoomBooking(
    guest._id,
    roomId,
  );

  return !!booking;
};

const reportIssue = async (reportData, userId) => {
  const { room, issue, priority } = reportData;

  if (!room) {
    throw new ErrorHandler("Room is required", 400);
  }

  const existingRoom = await roomRepository.getRoomById(room);

  if (!existingRoom) {
    throw new ErrorHandler("Room not found", 404);
  }

  const eligible = await hasActiveBookingForRoom(userId, room);

  if (!eligible) {
    throw new ErrorHandler(
      "Only guests with a booking for this room can report an issue",
      403,
    );
  }

  if (!issue || !issue.trim() || issue.trim().length < 3) {
    throw new ErrorHandler("Issue must be at least 3 characters", 400);
  }

  const reported = await maintenanceRepository.createRequest({
    room,
    reportedBy: userId,
    assignedTo: null,
    issue: issue.trim(),
    priority: priority || "medium",
    status: "open",
  });

  await auditLogServices.recordActivity({
    user: userId,
    action: "maintenance.reported",
    module: "maintenance",
    targetId: reported._id,
    description: `${issueLabel(reported)} was reported by a guest`,
  });

  return reported;
};

const checkReportEligibility = async (roomId, userId) => {
  const room = await roomRepository.getRoomById(roomId);

  if (!room) return false;

  return await hasActiveBookingForRoom(userId, roomId);
};

const getMyRequests = async (userId) => {
  const user = await userRepository.getUserById(userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  return await maintenanceRepository.getRequestsByReporter(userId);
};

export default {
  createRequest,
  reportIssue,
  checkReportEligibility,
  getMyRequests,
  getAllRequests,
  getRequestById,
  getRequestsByRoom,
  getRequestsByEmployee,
  getRequestsByStatus,
  getRequestsByPriority,
  updateRequest,
  deleteRequest,
};
