import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mainRoutes from "./src/routes/mainRoutes.js";
import notFound from "./src/middleware/notFoundMiddleware.js";
import errorMiddleware from "../Server/src/middleware/errorMiddleware.js";

const app = express();

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
      if (!origin || origin.startsWith("http://localhost:")) {
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
app.use(morgan("dev"));

app.use("/api", mainRoutes);

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Hotel Management API is running" });
});

app.use(notFound);
app.use(errorMiddleware);

export default app;
