import MaintenanceRequest from "../model/maintenanceModel.js";

const createRequest = async (requestData) => {
  return await MaintenanceRequest.create(requestData);
};

const getAllRequests = async () => {
  return await MaintenanceRequest.find()
    .populate("room")
    .populate("reportedBy")
    .populate("assignedTo")
    .sort({ createdAt: -1 });
};

const getRequestById = async (id) => {
  return await MaintenanceRequest.findById(id)
    .populate("room")
    .populate("reportedBy")
    .populate("assignedTo")
    .sort({ createdAt: -1 });
};

const getRequestsByRoom = async (roomId) => {
  return await MaintenanceRequest.find({ room: roomId })
    .populate("room")
    .populate("reportedBy")
    .populate("assignedTo")
    .sort({ createdAt: -1 });
};

const getRequestsByEmployee = async (employeeId) => {
  return await MaintenanceRequest.find({ assignedTo: employeeId })
    .populate("room")
    .populate("reportedBy")
    .populate("assignedTo")
    .sort({ createdAt: -1 });
};

const getRequestsByStatus = async (status) => {
  return await MaintenanceRequest.find({ status })
    .populate("room")
    .populate("reportedBy")
    .populate("assignedTo")
    .sort({ createdAt: -1 });
};

const getRequestsByPriority = async (priority) => {
  return await MaintenanceRequest.find({ priority })
    .populate("room")
    .populate("reportedBy")
    .populate("assignedTo")
    .sort({ createdAt: -1 });
};

const updateRequest = async (id, requestData) => {
  return await MaintenanceRequest.findByIdAndUpdate(id, requestData, {
    new: true,
    runValidators: true,
  })
    .populate("room")
    .populate("reportedBy")
    .populate("assignedTo");
};

const deleteRequest = async (id) => {
  return await MaintenanceRequest.findByIdAndDelete(id);
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
