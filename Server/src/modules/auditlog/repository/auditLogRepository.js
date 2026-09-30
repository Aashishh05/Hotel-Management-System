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

const getActivityStats = async () => {
  const [byModule, byStatus] = await Promise.all([
    AuditLog.aggregate([
      {
        $group: {
          _id: "$module",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    AuditLog.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  return {
    totalLogs: byModule.reduce((sum, item) => sum + item.count, 0),
    success: byStatus.find((item) => item._id === "success")?.count || 0,
    failed: byStatus.find((item) => item._id === "failed")?.count || 0,
    modules: byModule.reduce(
      (acc, item) => ({
        ...acc,
        [item._id || "api"]: item.count,
      }),
      {},
    ),
  };
};

export default { getAuditLogById, getAuditLogs, getActivityStats };
