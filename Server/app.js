import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mainRoutes from "./src/routes/mainRoutes.js";
import notFound from "./src/middleware/notFoundMiddleware.js";
import errorMiddleware from "../Server/src/middleware/errorMiddleware.js";

const app = express();

// Behind Render/Railway/Heroku-style proxies the server only sees the proxy
// hop unless this is set; rate limiting and Secure-cookie checks depend on it.
app.set("trust proxy", 1);

// Security headers. CSP stays off because this is a JSON API only, but the
// other defaults (HSTS, no-sniff, frameguard, CORP/COEP...) always apply.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // CLIENT_URL holds the frontend origin(s) as a comma-separated list —
      // Vercel serves a project from a production, branch and per-deploy
      // domain. Entries are normalized (scheme added when missing, trimmed,
      // no trailing slash, lowercase) so dashboard typos cannot break the
      // allowlist, and any local dev port is always welcome.
      const normalize = (url) => {
        const raw = url.trim();
        const withScheme = /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
        return withScheme.replace(/\/+$/, "").toLowerCase();
      };
      const allowed = (process.env.CLIENT_URL || "")
        .split(",")
        .map(normalize)
        .filter(Boolean);

      if (
        !origin ||
        origin.startsWith("http://localhost:") ||
        allowed.includes(normalize(origin))
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev"));

app.use("/api", mainRoutes);

// Unlike "/", this route is only for platform health checks and uptime pings.
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OK",
    uptime: process.uptime(),
  });
});

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Hotel Management API is running" });
});

app.use(notFound);
app.use(errorMiddleware);

export default app;
