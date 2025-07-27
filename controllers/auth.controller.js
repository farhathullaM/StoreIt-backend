import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

let refreshTokens = [];

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign(
      { id: user._id, username: user.firstName, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    refreshTokens.push(refreshToken);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const refreshToken = (req, res) => {
  const { refreshToken } = req.body;
  console.log(refreshToken, "refreshToken");
  if (!refreshToken) return res.status(401).json({ message: "Token required" });
  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json({ message: "Invalid token" });

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      username: user.firstName,
    });
    res.json({ accessToken: newAccessToken });
  });
};

export const logout = (req, res) => {
  const { refreshToken } = req.body;
  console.log(refreshToken, "refreshToken");
  refreshTokens = refreshTokens.filter((t) => t !== refreshToken);
  res.sendStatus(204);
};
