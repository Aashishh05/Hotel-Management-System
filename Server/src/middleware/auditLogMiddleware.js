import AuditLog from "../modules/auditlog/model/auditlogModel.js";

// Successful writes are recorded as readable business events by the
// services themselves (e.g. "guest.checked_in"), so the raw HTTP row for
// those is redundant and gets skipped. Reads and failures stay logged.
const isExplicitlyLogged = (req, res) =>
  res.statusCode < 400 && req.method !== "GET";

const auditLog = (req, res, next) => {
  const action = req.method;
  const module = req.baseUrl.split("/")[1] || req.path;

  res.on("finish", async () => {
    if (isExplicitlyLogged(req, res)) {
      return;
    }

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
