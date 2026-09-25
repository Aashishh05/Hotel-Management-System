import reportRepository from "../repository/reportRepository.js";

const getDashboardReport = async () => {
  const report = await reportRepository.getDashboardReport();

  return report;
};

export default { getDashboardReport };
