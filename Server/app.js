import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mainRoutes from "./src/routes/mainRoutes.js";
import errorMiddleware from "../Server/src/middleware/errorMiddleware.js";

const app = express();

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

app.use(errorMiddleware);

export default app;
