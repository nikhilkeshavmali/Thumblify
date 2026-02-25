import User from "../models/User.js";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

// Register Controller
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Set session
    req.session.isLoggedIn = true;
    req.session.userId = newUser._id;

    // Respond
    return res.json({
      message: "Account created successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Login Controller
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Set session
    req.session.isLoggedIn = true;
    req.session.userId = user._id;

    return res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

// Logout Controller
export const logoutUser = async (req: Request, res: Response) => {
  req.session.destroy((error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
    return res.json({ message: "Logout successful" });
  });
};

// Verify User Controller
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "Invalid user" });
    }

    return res.json({ user });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};