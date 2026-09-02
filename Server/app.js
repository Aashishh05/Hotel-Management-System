import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mainRoutes from "./src/routes/mainRoutes.js";
import errorMiddleware from "../Server/src/middleware/errorMiddleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/api", mainRoutes);

app.get("/", (res) => {
  res
    .status(200)
    .json({ success: true, message: "Hotel Management API is running" });
});

app.use(errorMiddleware);

export default app;
