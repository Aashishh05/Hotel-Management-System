import jwt from "jsonwebtoken";

// Access tokens are short-lived; the refresh token in its own httpOnly cookie
// is what keeps a session alive past the first minutes.
const ACCESS_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN ||
  process.env.JWT_EXPIRES_IN ||
  "15m";

// Give the refresh token its own secret so a stolen access token cannot be
// replayed at the refresh endpoint (and the other way around the token
// carries a type claim that is checked too).
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign({ ...payload, type: "refresh" }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, REFRESH_SECRET);

  if (decoded.type !== "refresh") {
    throw new jwt.JsonWebTokenError("Not a refresh token");
  }

  delete decoded.type;
  return decoded;
};

// payload = {
//   id: user._id,
//   role: user.role.name,
// };
