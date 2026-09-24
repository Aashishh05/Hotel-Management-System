import AuditLog from "../modules/auditlog/model/auditlogModel.js";

const auditLog = (req, res, next) => {
  const action = req.method;
  const module = req.baseUrl.split("/")[1] || req.path;

  res.on("finish", async () => {
    try {
      await AuditLog.create({
        user: req.user?._id,
        action,
        module,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        status: res.statusCode < 400 ? "success" : "failed",
      });
    } catch (error) {
      console.error("Audit log error:", error.message);
    }
  });

  next();
};

export default auditLog;
