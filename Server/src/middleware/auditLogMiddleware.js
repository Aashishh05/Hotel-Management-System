import AuditLog from "../modules/auditlog/model/auditlogModel";

const auditLog = (action, module) => async (req, res, next) => {
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
