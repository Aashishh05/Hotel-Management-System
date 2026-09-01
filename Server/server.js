import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import app from "./app.js";

connectDB();

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on Port ${PORT}`);
});
