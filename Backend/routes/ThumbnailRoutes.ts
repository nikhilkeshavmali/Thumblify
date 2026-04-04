import express, { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const imageModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-image",
});

// ✅ Generate Thumbnail using Gemini
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { title, prompt, style, aspect_ratio, color_scheme, text_overlay } =
      req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Combine prompt for Gemini
    const finalPrompt = `
      YouTube thumbnail style.
      Title: ${title}.
      Style: ${style || "Bold & Graphic"}.
      Aspect ratio: ${aspect_ratio || "16:9"}.
      Color scheme: ${color_scheme || "vibrant"}.
      Extra details: ${prompt || ""}.
      High quality, bold text, eye-catching.
    `;

    // ✅ Call Gemini API - fixed type error with 'as any'
    const result = await imageModel.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] } as any, // ✅ type assertion
    });

    // Extract image
    const imagePart = result.response.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData,
    );
    if (!imagePart?.inlineData?.data) {
      return res
        .status(500)
        .json({ message: "Gemini did not return an image" });
    }

    const base64Image = imagePart.inlineData.data;
    const imageUrl = `data:image/png;base64,${base64Image}`;

    // ✅ Save to MongoDB
    const newThumbnail = await Thumbnail.create({
      title,
      user_prompt: prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      image_url: imageUrl,
    });

    return res.status(201).json({
      message: "Thumbnail generated successfully",
      thumbnail: newThumbnail,
    });
  } catch (error: any) {
    console.error("Thumbnail Generation Error:", error.message || error);

    if (error.message?.includes("API key")) {
      return res.status(401).json({
        message: "Invalid Gemini API key. Check GEMINI_API_KEY in .env",
      });
    }
    if (error.message?.includes("model")) {
      return res.status(410).json({
        message: "Gemini model not available. Check model name.",
      });
    }

    return res.status(500).json({
      message: "Thumbnail generation failed",
    });
  }
});

// ✅ Get Thumbnail by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const thumbnail = await Thumbnail.findById(req.params.id);
    if (!thumbnail) {
      return res.status(404).json({ message: "Thumbnail not found" });
    }
    return res.json({ thumbnail });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch thumbnail" });
  }
});

export default router;
