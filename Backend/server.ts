import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import session from "express-session";
import MongoStore from "connect-mongo";
import dns from "node:dns/promises";
import { v2 as cloudinary } from "cloudinary";

import connectDB from "./configs/db";
import AuthRouter from "./routes/AuthRoutes";
import ThumbnailRouter from "./routes/ThumbnailRoutes";
import UserRouter from "./routes/UserRoutes";

// ✅ Force Google DNS (fix network issues sometimes)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// ✅ Extend session types
declare module "express-session" {
  interface SessionData {
    isLoggedIn: boolean;
    userId: string;
  }
}

// ✅ Validate required ENV variables
const requiredEnvVars = [
  "MONGODB_URI",
  "SESSION_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "GEMINI_API_KEY", // ✅ replaced HF_TOKEN with GEMINI_API_KEY
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ ERROR: ${envVar} is not defined in .env file`);
    process.exit(1);
  }
}

const startServer = async () => {
  try {
    // ✅ Connect MongoDB
    await connectDB();

    // ✅ Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    });

    const app = express();

    // ✅ CORS
    app.use(
      cors({
        origin: ["http://localhost:5173", "http://localhost:3000"],
        credentials: true,
      }),
    );

    // ✅ JSON Middleware
    app.use(express.json());

    // ✅ Session
    app.use(
      session({
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
        store: MongoStore.create({
          mongoUrl: process.env.MONGODB_URI as string,
          collectionName: "sessions",
        }),
      }),
    );

    // ✅ Health Route
    app.get("/", (req: Request, res: Response) => {
      res.send("🚀 Server is Live!");
    });

    // ✅ API Routes
    app.use("/api/auth", AuthRouter);
    app.use("/api/thumbnail", ThumbnailRouter);
    app.use("/api/user", UserRouter);

    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
