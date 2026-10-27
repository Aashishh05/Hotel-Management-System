import jwt from "jsonwebtoken";
import User from "../modules/user/model/userModel.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, please login" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select("-password")
      .populate("role", "name");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, user not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const protectOptional = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id)
        .select("-password")
        .populate("role", "name");

      req.user = user || null;
    } catch {
      // Distinguish "expired access token" from "not logged in" so /auth/me
      // can return 401 for the former and let the client silently refresh.
      req.user = null;
      req.authExpired = true;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export default protect;
export { protectOptional };
