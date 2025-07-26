import s3 from "../utils/s3.js";
import File from "../models/File.js";
import { v4 as uuidv4 } from "uuid";

export const uploadFile = async (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  if (!file) return res.status(400).json({ message: "No file uploaded" });

  const key = `uploads/${uuidv4()}_${file.originalname}`;

  try {
    const s3Data = await s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    const newFile = new File({
      filename: key,
      originalName: file.originalname,
      size: file.size,
      contentType: file.mimetype,
      url: s3Data.Location,
      user: userId,
    });

    await newFile.save();

    res.status(201).json(newFile);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to upload file", error: err.message });
  }
};

export const listFiles = async (req, res) => {
  const userId = req.user.id;
  try {
    const files = await File.find({ user: userId });
    res.json(files);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to list files", error: err.message });
  }
};

export const deleteFile = async (req, res) => {
  const fileId = req.params.id;

  try {
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "File not found" });

    await s3
      .deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.filename,
      })
      .promise();

    await file.deleteOne();

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete file", error: err.message });
  }
};
