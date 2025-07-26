import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

const PORT = process.env.PORT || 5000;

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (err) {
  console.error("MongoDB connection error:", err);
}
