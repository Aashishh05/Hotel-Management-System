import Permission from "../modules/permission/model/permissionModel";

const checkPermission = (module, action) => async (req, res, next) => {
  try {
    const { user } = req;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role?.name === "superadmin") {
      return next();
    }

    const permission = await Permission.findOne({
      role: user.role._id,
    });

    if (!permission) {
      return res.status(403).json({
        success: false,
        message: "No permissions found",
      });
    }

    const modulePermissions = permission.modules.get(module);

    if (!modulePermissions || !modulePermissions[action]) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default checkPermission;
