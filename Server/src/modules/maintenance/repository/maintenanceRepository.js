import MaintenanceRequest from "../model/maintenanceModel.js";

const populateRefs = [
  { path: "room" },
  { path: "reportedBy", select: "name email avatar" },
  { path: "assignedTo", select: "name email avatar" },
];

const createRequest = async (requestData) => {
  const request = await MaintenanceRequest.create(requestData);

  return await MaintenanceRequest.findById(request._id).populate(populateRefs);
};

const getAllRequests = async () => {
  return await MaintenanceRequest.find().populate(populateRefs).sort({ createdAt: -1 });
};

const getRequestById = async (id) => {
  return await MaintenanceRequest.findById(id).populate(populateRefs);
};

const getRequestsByRoom = async (roomId) => {
  return await MaintenanceRequest.find({ room: roomId })
    .populate(populateRefs)
    .sort({ createdAt: -1 });
};

const getRequestsByEmployee = async (employeeId) => {
  return await MaintenanceRequest.find({ assignedTo: employeeId })
    .populate(populateRefs)
    .sort({ createdAt: -1 });
};

const getRequestsByStatus = async (status) => {
  return await MaintenanceRequest.find({ status })
    .populate(populateRefs)
    .sort({ createdAt: -1 });
};

const getRequestsByPriority = async (priority) => {
  return await MaintenanceRequest.find({ priority })
    .populate(populateRefs)
    .sort({ createdAt: -1 });
};

const getRequestsByReporter = async (reportedById) => {
  return await MaintenanceRequest.find({ reportedBy: reportedById })
    .populate(populateRefs)
    .sort({ createdAt: -1 });
};

const updateRequest = async (id, requestData) => {
  return await MaintenanceRequest.findByIdAndUpdate(id, requestData, {
    new: true,
    runValidators: true,
  }).populate(populateRefs);
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
  getRequestsByReporter,
  updateRequest,
  deleteRequest,
};
