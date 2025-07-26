import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    filename: String,
    originalName: String,
    size: Number,
    contentType: String,
    url: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("File", fileSchema);
