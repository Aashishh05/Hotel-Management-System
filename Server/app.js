import express from "express";
import morgan from "morgan";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/", (res) => {
  res
    .status(200)
    .json({ success: true, message: "Hotel Management API is running" });
});

export default app;
