// controllers/thumbnailController.ts
import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Style prompts
const stylePrompts = {
  "Bold & Graphic":
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition",
  "Tech/Futuristic":
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic",
  Minimalist:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design",
  Photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, DSLR-style photography, lifestyle realism",
  Illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative vector art style",
};

// Color scheme descriptions
const colorSchemeDescriptions = {
  vibrant: "vibrant and energetic colors, high saturation, bold contrasts",
  sunset:
    "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
  forest: "natural green tones, earthy colors, calm and organic palette",
  neon: "neon glow effects, electric blues and pinks, cyberpunk lighting",
  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish",
  monochrome: "black and white color scheme, high contrast, dramatic lighting",
  ocean: "cool blue and teal tones, aquatic color palette, fresh and clean",
  pastel: "soft pastel colors, low saturation, gentle tones, calm and friendly",
};

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const imageModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-image",
});

// Generate thumbnail
export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const { userId } = req.session as any;
    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;

    if (!title || !style) {
      return res
        .status(400)
        .json({ message: "Missing required fields: title, style" });
    }

    // Create DB record
    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    // Build prompt
    let prompt = `Create a professional YouTube thumbnail for: "${title}". Style: ${stylePrompts[style as keyof typeof stylePrompts]}. `;
    if (color_scheme)
      prompt += `Color scheme: ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]}. `;
    if (user_prompt) prompt += `Extra: ${user_prompt}. `;
    prompt += `Aspect ratio: ${aspect_ratio || "16:9"}. Make it bold, click-worthy, high quality.`;

    // Call Gemini - fixed type error with 'as any'
    const result = await imageModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] } as any, // ✅ type assertion
    });

    const imagePart = result.response.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData,
    );
    if (!imagePart?.inlineData?.data) throw new Error("No image generated");

    const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
    const filename = `thumbnail-${Date.now()}.png`;
    const filePath = path.join("images", filename);
    fs.mkdirSync("images", { recursive: true });
    fs.writeFileSync(filePath, imageBuffer);

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
    });
    fs.unlinkSync(filePath);

    thumbnail.image_url = uploadResult.secure_url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    res.json({ message: "Thumbnail generated", thumbnail });
  } catch (error: any) {
    console.error("Gemini error:", error.message);
    res.status(500).json({ message: error.message || "Generation failed" });
  }
};

// Get thumbnail by ID
export const getThumbnailById = async (req: Request, res: Response) => {
  try {
    const thumbnail = await Thumbnail.findById(req.params.id);
    if (!thumbnail) {
      return res.status(404).json({ message: "Thumbnail not found" });
    }
    return res.json({ thumbnail });
  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ message: "Failed to fetch thumbnail" });
  }
};

// Delete thumbnail
export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.session as any;
    await Thumbnail.findOneAndDelete({ _id: id, userId });
    res.json({ message: "Thumbnail deleted successfully" });
  } catch (error: any) {
    console.error("Delete error:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to delete thumbnail" });
  }
};
