import reportRepository from "../repository/reportRepository.js";

const getDashobardReport = async () => {
  const report = await reportRepository.getDashboardReport();

  return report;
};

export default getDashobardReport;
