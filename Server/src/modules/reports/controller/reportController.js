import reportServices from "../services/reportServices.js";
import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";
import auditLogServices from "../../auditlog/services/auditLogServices.js";

export const getDashboardReport = asyncErrorHandler(async (req, res) => {
  const report = await reportServices.getDashboardReport();

  await auditLogServices.recordActivity({
    user: req.user?._id,
    action: "report.viewed",
    module: "reports",
    description: `${req.user?.name || "Someone"} viewed the dashboard report`,
  });

  res.status(200).json({
    success: true,
    message: "Dashboard report fetched successfully",
    data: report,
  });
});
