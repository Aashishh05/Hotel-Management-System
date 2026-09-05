import reportServices from "../services/reportServices.js";
import asyncErrorHandler from "../../../middleware/asyncErrorHandler.js";

export const getDashboardReport = asyncErrorHandler(async (req, res) => {
  const report = await reportServices.getDashboardReport();

  res.status(200).json({
    success: true,
    message: "Dashboard report fetched successfully",
    data: report,
  });
});
