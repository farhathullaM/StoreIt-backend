import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, 
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ userId: 1 });

export default mongoose.model("RefreshToken", refreshTokenSchema);
