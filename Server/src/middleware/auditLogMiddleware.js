import AuditLog from "../modules/auditlog/model/auditlogModel.js";

// Successful reads are pure noise and successful writes are already recorded
// as readable business events by the services, so only rejected requests are
// kept here.
const auditLog = (req, res, next) => {
  const module = req.baseUrl.split("/")[1] || req.path;

  res.on("finish", async () => {
    if (res.statusCode < 400) {
      return;
    }

    try {
      await AuditLog.create({
        user: req.user?._id,
        action: "request.failed",
        module,
        description: `${req.method} ${req.originalUrl} was rejected with ${
          res.statusCode
        }`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        status: "failed",
      });
    } catch (error) {
      console.error("Audit log error:", error.message);
    }
  });

  next();
};

export default auditLog;
