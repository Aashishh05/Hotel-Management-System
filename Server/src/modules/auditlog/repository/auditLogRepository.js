import AuditLog from "../model/auditlogModel.js";

const getAuditLogs = async (filter = {}, options = {}) => {
  const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;

  const skip = (page - 1) * limit;

  const [logs, totalLogs] = await Promise.all([
    AuditLog.find(filter)
      .populate("user", "name email role")
      .sort(sort)
      .skip(skip)
      .limit(limit),

    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    totalLogs,
    page,
    limit,
    totalPages: Math.ceil(totalLogs / limit),
  };
};

const getAuditLogById = async (id) => {
  return AuditLog.find(id).populate("user", "name email role");
};

export default { getAuditLogById, getAuditLogs };
