import auditLogRepository from "../repository/auditLogRepository.js";
import ErrorHandler from "../../../utils/ErrorHandler.js";

const getAuditLogs = async (query) => {
  const { page = 1, limit = 20, action, module, status, user } = query;

  const filter = {};

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

const getAudutLogById = async (id) => {
  const auditLog = await auditLogRepository.getAuditLogById(id);

  if (!auditLog) {
    throw new ErrorHandler("AuditLog not found", 404);
  }
  return auditLog;
};

export default { getAuditLogs, getAudutLogById };
