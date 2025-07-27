import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

export const register = async (req, res) => {
  const { firstName, lastName, phone, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user._id,
      username: user.firstName,
      email: user.email,
    });

    const refreshToken = generateRefreshToken({ id: user._id });

    // Save refresh token to database
    const newRefreshToken = new RefreshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await newRefreshToken.save();

    // Set refresh token as httpOnly cookie (more secure)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    // Check if refresh token exists in database
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ _id: storedToken._id });
      return res.status(403).json({ message: "Refresh token expired" });
    }

    // Verify the token
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) {
          // Remove invalid token from database
          await RefreshToken.deleteOne({ _id: storedToken._id });
          return res.status(403).json({ message: "Invalid refresh token" });
        }

        // Get user details
        const user = await User.findById(decoded.id);
        if (!user) {
          await RefreshToken.deleteOne({ _id: storedToken._id });
          return res.status(403).json({ message: "User not found" });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken({
          id: user._id,
          username: user.firstName,
          email: user.email,
        });

        res.json({ accessToken: newAccessToken });
      }
    );
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      // Remove refresh token from database
      await RefreshToken.deleteOne({ token: refreshToken });

      // Clear the cookie
      res.clearCookie("refreshToken");
    }

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Optional: Clean up expired tokens (run this periodically)
export const cleanupExpiredTokens = async () => {
  try {
    await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log("Expired refresh tokens cleaned up");
  } catch (err) {
    console.error("Error cleaning up expired tokens:", err);
  }
};
