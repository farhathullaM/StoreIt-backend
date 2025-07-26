import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import multer from "multer";
import { uploadFile, listFiles, deleteFile } from "../controllers/file.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", authenticate, upload.single("file"), uploadFile);
router.get("/", authenticate, listFiles);
router.delete("/:id", authenticate, deleteFile);

export default router;
