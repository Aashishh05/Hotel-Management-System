import auditLogRepository from "../repository/auditLogRepository.js";
import AuditLog from "../model/auditlogModel.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";

const recordActivity = async ({
  user,
  action,
  module,
  description,
  targetId = null,
  status = "success",
}) => {
  try {
    await AuditLog.create({
      user: user || null,
      action,
      module,
      description,
      targetId,
      status,
    });
  } catch (error) {
    console.error("Activity log error:", error.message);
  }
};

const getAuditLogs = async (query) => {
  const { page = 1, limit = 20, action, module, status, user } = query;

  // Only business events ("bookings.created") belong in the activity feed.
  // Legacy raw HTTP rows ("GET", "POST", ...) are never returned.
  const filter = { action: { $regex: "\\." } };

  if (action) {
    filter.action = action;
  }

  if (module) {
    filter.module = module;
  }
  if (status) {
    filter.status = status;
  }

  if (user) {
    filter.user = user;
  }

  const result = await auditLogRepository.getAuditLogs(filter, {
    page: Number(page),
    limit: Number(limit),
  });
  return result;
};

const getActivityStats = async () => {
  return await auditLogRepository.getActivityStats();
};

const getAudutLogById = async (id) => {
  const auditLog = await auditLogRepository.getAuditLogById(id);

  if (!auditLog) {
    throw new ErrorHandler("AuditLog not found", 404);
  }
  return auditLog;
};

export default {
  getAuditLogs,
  getAudutLogById,
  getActivityStats,
  recordActivity,
};
