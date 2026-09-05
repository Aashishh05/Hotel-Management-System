import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import auditLogServices from "../services/auditLogServices.js";

export const getAuditLogs = asyncErrorHandler(async (req, res) => {
  const result = await auditLogServices.getAuditLogs(req.query);

  res.status(200).json({
    success: true,
    message: "Audit Logs fetched successfully",
    data: result,
  });
});

export const getAuditLogById = asyncErrorHandler(async (req, res) => {
  const auditLog = await auditLogServices.getAudutLogById(req.params.id);

  res
    .status(200)
    .json({
      success: true,
      message: "Audit Log fetched successfully",
      data: auditLog,
    });
});
